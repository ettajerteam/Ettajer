"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Minus,
  Undo2,
  Redo2,
  RemoveFormatting,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ToolbarVariant = "compact" | "full";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Extra classes on the outer shell */
  className?: string;
  /** Min height for the editable area (default 120px) */
  minHeightClassName?: string;
  /** compact = product fields; full = blog body */
  variant?: ToolbarVariant;
}

type ToolDef = {
  icon: LucideIcon;
  label: string;
  action: () => void;
  active?: boolean;
  disabled?: boolean;
};

function ToolButton({
  icon: Icon,
  label,
  action,
  active,
  disabled,
}: ToolDef) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      disabled={disabled}
      className={cn(
        "h-8 w-8 shrink-0",
        active && "bg-accent text-accent-foreground"
      )}
      onClick={action}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function Divider() {
  return (
    <span
      className="mx-0.5 hidden h-5 w-px shrink-0 bg-black/[0.08] sm:block dark:bg-white/10"
      aria-hidden
    />
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeightClassName = "min-h-[120px]",
  variant = "compact",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#007AFF] underline underline-offset-2",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Describe your product...",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none px-4 py-3 focus:outline-none",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
          "[&_a]:text-[#007AFF] [&_hr]:my-4 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 dark:[&_code]:bg-white/10",
          minHeightClassName
        ),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href })
      .run();
  }, [editor]);

  if (!editor) return null;

  const compactTools: ToolDef[] = [
    {
      icon: Bold,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: Heading2,
      label: "Heading",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: List,
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
  ];

  const fullGroups: ToolDef[][] = [
    [
      {
        icon: Undo2,
        label: "Undo",
        action: () => editor.chain().focus().undo().run(),
        disabled: !editor.can().undo(),
      },
      {
        icon: Redo2,
        label: "Redo",
        action: () => editor.chain().focus().redo().run(),
        disabled: !editor.can().redo(),
      },
    ],
    [
      {
        icon: Heading2,
        label: "Heading 2",
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
      },
      {
        icon: Heading3,
        label: "Heading 3",
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive("heading", { level: 3 }),
      },
    ],
    [
      {
        icon: Bold,
        label: "Bold",
        action: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive("bold"),
      },
      {
        icon: Italic,
        label: "Italic",
        action: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive("italic"),
      },
      {
        icon: UnderlineIcon,
        label: "Underline",
        action: () => editor.chain().focus().toggleUnderline().run(),
        active: editor.isActive("underline"),
      },
      {
        icon: Strikethrough,
        label: "Strikethrough",
        action: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive("strike"),
      },
      {
        icon: Code,
        label: "Inline code",
        action: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive("code"),
      },
    ],
    [
      {
        icon: Link2,
        label: editor.isActive("link") ? "Edit / remove link" : "Add link",
        action: setLink,
        active: editor.isActive("link"),
      },
      {
        icon: Quote,
        label: "Quote",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive("blockquote"),
      },
      {
        icon: Minus,
        label: "Divider line",
        action: () => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
    [
      {
        icon: List,
        label: "Bullet list",
        action: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        icon: ListOrdered,
        label: "Numbered list",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
      {
        icon: RemoveFormatting,
        label: "Clear formatting",
        action: () =>
          editor.chain().focus().unsetAllMarks().clearNodes().run(),
      },
    ],
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-input bg-background/50 backdrop-blur-sm",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-0.5 border-b px-1.5 py-1",
          variant === "full" && "flex-wrap"
        )}
      >
        {variant === "compact"
          ? compactTools.map((tool) => (
              <ToolButton key={tool.label} {...tool} />
            ))
          : fullGroups.map((group, gi) => (
              <div key={gi} className="flex items-center">
                {gi > 0 ? <Divider /> : null}
                {group.map((tool) => (
                  <ToolButton key={tool.label} {...tool} />
                ))}
              </div>
            ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
