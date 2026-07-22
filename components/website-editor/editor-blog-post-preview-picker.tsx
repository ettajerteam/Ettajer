"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditorControlSkeleton } from "@/components/website-editor/editor-skeleton";

interface BlogPostOption {
  slug: string;
  title: string;
}

interface EditorBlogPostPreviewPickerProps {
  value: string;
  onChange: (slug: string) => void;
}

export function EditorBlogPostPreviewPicker({
  value,
  onChange,
}: EditorBlogPostPreviewPickerProps) {
  const [posts, setPosts] = useState<BlogPostOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/blog");
        if (!res.ok) return;
        const data = (await res.json()) as {
          posts?: Array<{ slug: string; title: string; status?: string }>;
        };
        if (cancelled) return;
        setPosts(
          (data.posts ?? [])
            .filter((p) => p.status === "published")
            .filter((p) => typeof p.slug === "string" && typeof p.title === "string")
            .map((p) => ({ slug: p.slug, title: p.title }))
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <EditorControlSkeleton />;
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">No blog posts yet</p>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          Create posts in your dashboard blog to preview articles with real content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-neutral-600">Preview article</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-white text-sm">
          <SelectValue placeholder="Choose a post" />
        </SelectTrigger>
        <SelectContent>
          {posts.map((post) => (
            <SelectItem key={post.slug} value={post.slug}>
              <span className="inline-flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-neutral-400" />
                {post.title}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-neutral-500">Showing live journal content in the preview.</p>
    </div>
  );
}
