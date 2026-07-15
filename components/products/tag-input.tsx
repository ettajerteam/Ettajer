"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[44px] rounded-xl border border-input bg-background/50 backdrop-blur-sm px-3 py-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="default" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length ? "" : "Type a tag and press Enter"}
          className="flex-1 min-w-[120px] border-0 bg-transparent shadow-none focus-visible:ring-0 h-8 px-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add a tag</p>
    </div>
  );
}
