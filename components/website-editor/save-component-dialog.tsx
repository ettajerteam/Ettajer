"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SaveComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description?: string) => void;
  sectionCount: number;
}

export function SaveComponentDialog({
  open,
  onOpenChange,
  onSave,
  sectionCount,
}: SaveComponentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, description.trim() || undefined);
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as component</DialogTitle>
          <DialogDescription>
            Save {sectionCount} section{sectionCount !== 1 ? "s" : ""} as a reusable component.
            Changes to the component definition will propagate to all linked instances.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="component-name">Name</Label>
            <Input
              id="component-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Promo banner"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="component-desc">Description (optional)</Label>
            <Textarea
              id="component-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for your library"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim()}>
            Save component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
