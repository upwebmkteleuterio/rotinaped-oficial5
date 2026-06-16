import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  sender_name: string;
  sender_avatar?: string;
  text: string;
  created_at: string;
  isMe: boolean;
}

export function useCommunityChat(channelId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const userProfileRef = useRef<{ name: string; avatarUrl: string }>({
    name: 'Mãe',
    avatarUrl: ''
  });

  const channelRef = useRef<any>(null);
  const isTypingRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch current user profile name on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (!error && data?.full_name) {
          userProfileRef.current = {
            name: data.full_name,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=1b6392&color=fff`
          };
        } else {
          const name = user.user_metadata?.full_name || 'Mãe';
          userProfileRef.current = {
            name,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1b6392&color=fff`
          };
        }
      } catch (err) {
        console.error('[useCommunityChat] Error fetching user profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  // 2. Fetch initial messages & subscribe to Realtime channel
  useEffect(() => {
    if (!user || !channelId) return;

    let isMounted = true;

    // Helper to fetch message history
    const fetchHistory = async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('community_messages')
          .select('*')
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (isMounted) {
          const mapped = (data || []).map((msg: any) => ({
            id: msg.id,
            channel_id: msg.channel_id,
            user_id: msg.user_id,
            sender_name: msg.sender_name,
            sender_avatar: msg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=random`,
            text: msg.text,
            created_at: msg.created_at,
            isMe: msg.user_id === user.id
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error('[useCommunityChat] Error fetching chat history:', err);
      } finally {
        if (isMounted && showLoadingIndicator) setIsLoading(false);
      }
    };

    // Helper to setup and subscribe to Supabase Realtime + Presence channel
    const setupRealtimeSubscription = () => {
      // Clean up previous channel if exists
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      const roomName = `community_chat_${channelId}`;
      const channel = supabase.channel(roomName, {
        config: {
          presence: {
            key: user.id
          }
        }
      });

      channelRef.current = channel;

      // Listen to DB insertions
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (!isMounted) return;

          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                channel_id: newMsg.channel_id,
                user_id: newMsg.user_id,
                sender_name: newMsg.sender_name,
                sender_avatar: newMsg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newMsg.sender_name)}&background=random`,
                text: newMsg.text,
                created_at: newMsg.created_at,
                isMe: newMsg.user_id === user.id
              }
            ];
          });
        }
      );

      // Track Presence (Online Users and Typing States)
      channel.on('presence', { event: 'sync' }, () => {
        if (!isMounted) return;
        const state = channel.presenceState();
        
        const uniqueUsersCount = Object.keys(state).length;
        setOnlineCount(uniqueUsersCount || 1);

        const typing: string[] = [];
        Object.entries(state).forEach(([userId, presences]) => {
          if (userId === user.id) return;
          
          const presence = presences[0] as any;
          if (presence?.isTyping && presence?.userName) {
            typing.push(presence.userName);
          }
        });
        setTypingUsers(typing);
      });

      // Subscribe to channel
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && isMounted) {
          await channel.track({
            userName: userProfileRef.current.name,
            userAvatar: userProfileRef.current.avatarUrl,
            isTyping: false
          });
        }
      });
    };

    // Initial setup
    fetchHistory(true);
    setupRealtimeSubscription();

    // 3. LISTEN TO TAB/APP RESUME (Visibility Change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useCommunityChat] App resumed. Re-syncing messages & reconnecting WebSocket...');
        // Pull missed history quietly in background (no loader flicker)
        fetchHistory(false);
        // Resubscribe to live messaging to wake up stale background connection
        setupRealtimeSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [channelId, user]);

  // 3. Send message to DB
  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    const messageText = text.trim();
    const profile = userProfileRef.current;

    const tempId = crypto.randomUUID();
    const tempMsg: ChatMessage = {
      id: tempId,
      channel_id: channelId,
      user_id: user.id,
      sender_name: profile.name,
      sender_avatar: profile.avatarUrl,
      text: messageText,
      created_at: new Date().toISOString(),
      isMe: true
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      const { error } = await supabase.from('community_messages').insert({
        channel_id: channelId,
        user_id: user.id,
        sender_name: profile.name,
        sender_avatar: profile.avatarUrl,
        text: messageText
      });

      if (error) throw error;
    } catch (err) {
      console.error('[useCommunityChat] Error inserting message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // 4. Update typing status inside Presence channel
  const setTyping = (isTyping: boolean) => {
    if (!channelRef.current || !user) return;

    if (isTypingRef.current === isTyping) {
      if (isTyping) {
        resetTypingTimeout();
      }
      return;
    }

    isTypingRef.current = isTyping;

    channelRef.current.track({
      userName: userProfileRef.current.name,
      userAvatar: userProfileRef.current.avatarUrl,
      isTyping: isTyping
    }).catch((err: any) => {
      console.error('[useCommunityChat] Error tracking presence:', err);
    });

    if (isTyping) {
      resetTypingTimeout();
    }
  };

  const resetTypingTimeout = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 4000);
  };

  return {
    messages,
    onlineCount,
    typingUsers,
    isLoading,
    sendMessage,
    setTyping
  };
}