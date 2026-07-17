import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Link as LinkIcon, 
  Unlink, 
  Undo, 
  Redo,
  List,
  ListOrdered
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('bold') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Negrito"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('italic') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Itálico"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('underline') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Sublinhado"
      >
        <UnderlineIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('strike') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Tachado"
      >
        <Strikethrough size={18} />
      </button>

      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('bulletList') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Lista"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('orderedList') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Lista Numerada"
      >
        <ListOrdered size={18} />
      </button>

      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />

      <button
        type="button"
        onClick={setLink}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          editor.isActive('link') ? "bg-[#1b6392] text-white" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Inserir Link"
      >
        <LinkIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          !editor.isActive('link') ? "opacity-50" : "text-slate-600 hover:bg-slate-200"
        )}
        title="Remover Link"
      >
        <Unlink size={18} />
      </button>

      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-50"
        title="Desfazer"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-50"
        title="Refazer"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-[#1b6392] underline cursor-pointer font-medium hover:text-[#154d72]',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3 bg-white rounded-b-xl",
          className
        ),
      },
    },
  });

  return (
    <div className="border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#1b6392]/20 focus-within:border-[#1b6392] transition-all overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
