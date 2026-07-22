"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function normalizeHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p></p>" || trimmed === "<p><br></p>") return "";
  return trimmed;
}

interface InspectorRichTextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  description?: string;
  onChange: (value: string) => void;
}

/** Simple WYSIWYG writer for merchants — never shows raw HTML tags. */
export function InspectorRichTextField({
  id,
  label,
  value,
  placeholder,
  description,
  onChange,
}: InspectorRichTextFieldProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write your text here…",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[110px] max-h-[220px] overflow-y-auto px-3 py-2.5 text-xs leading-relaxed text-neutral-800 focus:outline-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4",
        "aria-labelledby": `${id}-label`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(normalizeHtml(ed.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    const current = normalizeHtml(editor.getHTML());
    if (normalizeHtml(next) !== current) {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-neutral-600">{label}</Label>
        <div className="h-[140px] animate-pulse rounded-lg border border-neutral-200 bg-neutral-50" />
      </div>
    );
  }

  const tools = [
    {
      label: "Bold",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "List",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
  ];

  return (
    <div className="space-y-1.5">
      <Label id={`${id}-label`} className="text-xs text-neutral-600">
        {label}
      </Label>
      {description ? <p className="text-[11px] text-neutral-400">{description}</p> : null}
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className="overflow-hidden rounded-lg border border-neutral-200 bg-white focus-within:border-[#007AFF]/40 focus-within:ring-1 focus-within:ring-[#007AFF]/20"
      >
        <div className="flex items-center gap-0.5 border-b border-neutral-100 bg-neutral-50/80 px-1.5 py-1">
          {tools.map((tool) => (
            <Button
              key={tool.label}
              type="button"
              variant="ghost"
              size="icon"
              title={tool.label}
              aria-label={tool.label}
              className={cn(
                "h-7 w-7 text-neutral-500",
                tool.active && "bg-white text-neutral-900 shadow-sm"
              )}
              onClick={tool.action}
            >
              <tool.icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
