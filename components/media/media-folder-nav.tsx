"use client";

import { useState } from "react";
import { ChevronRight, Folder, FolderPlus, Home } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createMediaFolder } from "@/lib/media/api";
import type { MediaFolder } from "@/lib/media/types";
import { cn } from "@/lib/utils";

interface MediaFolderNavProps {
  folders: MediaFolder[];
  currentFolderId: string | null;
  onFolderChange: (folderId: string | null) => void;
  onFolderCreated: (folder: MediaFolder) => void;
  className?: string;
}

export function MediaFolderNav({
  folders,
  currentFolderId,
  onFolderChange,
  onFolderCreated,
  className,
}: MediaFolderNavProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const folder = await createMediaFolder({
        name,
        parentId: currentFolderId,
      });
      onFolderCreated(folder);
      setCreateOpen(false);
      setNewName("");
      toast.success("Folder created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create folder");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
          Folders
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg"
          onClick={() => setCreateOpen(true)}
          aria-label="New folder"
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <nav className="space-y-0.5">
        <button
          type="button"
          onClick={() => onFolderChange(null)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
            currentFolderId === null
              ? "bg-[#007AFF]/10 font-medium text-[#007AFF]"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          <Home className="h-3.5 w-3.5 shrink-0" />
          All files
        </button>

        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => onFolderChange(folder.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
              currentFolderId === folder.id
                ? "bg-[#007AFF]/10 font-medium text-[#007AFF]"
                : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            <Folder className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{folder.name}</span>
            {folder.assetCount != null && folder.assetCount > 0 && (
              <span className="ml-auto text-[10px] text-neutral-400">{folder.assetCount}</span>
            )}
          </button>
        ))}
      </nav>

      {currentFolder && (
        <div className="flex items-center gap-1 pt-1 text-[10px] text-neutral-400">
          <button
            type="button"
            className="hover:text-neutral-600"
            onClick={() => onFolderChange(null)}
          >
            All files
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-neutral-600">{currentFolder.name}</span>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Organize your media into folders for easier reuse.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name"
            className="h-9 rounded-lg text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              className="bg-[#007AFF] hover:bg-[#0066DD]"
              onClick={() => void handleCreate()}
              disabled={creating || !newName.trim()}
            >
              {creating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
