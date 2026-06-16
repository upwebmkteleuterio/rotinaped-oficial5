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
  
  // Ref to hold current user details to avoid multiple DB fetches and keep track updated
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
        // Try to get from public.profiles
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
          // Fallback to metadata
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

    setIsLoading(true);

    // Fetch message history (automatically limited/cleaned up on the server via trigger)
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('community_messages')
          .select('*')
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true });

        if (error) throw error;

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
      } catch (err) {
        console.error('[useCommunityChat] Error fetching chat history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    // Setup Supabase Realtime for Messages and Presence
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
        // Skip appending if it's already in state to avoid race conditions/duplicates
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
      const state = channel.presenceState();
      
      // Calculate total online users in this channel (number of unique connections)
      const uniqueUsersCount = Object.keys(state).length;
      setOnlineCount(uniqueUsersCount || 1);

      // Extract users who are typing (excluding the current user)
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
      if (status === 'SUBSCRIBED') {
        // Track initial presence (not typing)
        await channel.track({
          userName: userProfileRef.current.name,
          userAvatar: userProfileRef.current.avatarUrl,
          isTyping: false
        });
      }
    });

    return () => {
      // Clear timeout and unsubscribe when leaving room
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [channelId, user]);

  // 3. Send message to DB
  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    const messageText = text.trim();
    const profile = userProfileRef.current;

    // Temporary optimistic message for responsive UX
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
      // Remove optimistic message if insert failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  // 4. Update typing status inside Presence channel
  const setTyping = (isTyping: boolean) => {
    if (!channelRef.current || !user) return;

    // Only update track state if state actually changes
    if (isTypingRef.current === isTyping) {
      // If typing is true, reset the idle timer
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
    }, 4000); // stop typing animation after 4 seconds of idle time
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
