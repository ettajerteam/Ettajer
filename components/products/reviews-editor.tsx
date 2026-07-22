"use client";

import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductReview } from "@/types";
import { cn } from "@/lib/utils";

interface ReviewsEditorProps {
  reviews: ProductReview[];
  onChange: (reviews: ProductReview[]) => void;
}

export function ReviewsEditor({ reviews, onChange }: ReviewsEditorProps) {
  function addReview() {
    onChange([
      ...reviews,
      {
        id: crypto.randomUUID(),
        author: "",
        location: "",
        rating: 5,
        text: "",
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function updateReview(id: string, patch: Partial<ProductReview>) {
    onChange(reviews.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeReview(id: string) {
    onChange(reviews.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-3">
      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-4 text-center text-xs text-muted-foreground">
          No reviews yet. Add real customer quotes so your product page doesn’t show placeholder text.
        </p>
      ) : (
        reviews.map((review, index) => (
          <div
            key={review.id}
            className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                Review {index + 1}
              </p>
              <button
                type="button"
                onClick={() => removeReview(review.id)}
                className="rounded p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove review ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`review-author-${review.id}`}>Name</Label>
                <Input
                  id={`review-author-${review.id}`}
                  value={review.author}
                  placeholder="Customer name"
                  onChange={(e) => updateReview(review.id, { author: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`review-location-${review.id}`}>City (optional)</Label>
                <Input
                  id={`review-location-${review.id}`}
                  value={review.location ?? ""}
                  placeholder="e.g. Casablanca"
                  onChange={(e) => updateReview(review.id, { location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = i + 1;
                  const active = value <= review.rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateReview(review.id, { rating: value })}
                      className="rounded p-0.5 transition hover:scale-105"
                      aria-label={`${value} stars`}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          active ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`review-text-${review.id}`}>Review</Label>
              <Textarea
                id={`review-text-${review.id}`}
                rows={3}
                value={review.text}
                placeholder="What they said about this product…"
                onChange={(e) => updateReview(review.id, { text: e.target.value })}
              />
            </div>
          </div>
        ))
      )}

      <Button type="button" variant="outline" size="sm" onClick={addReview} className="h-8 w-full text-xs">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add review
      </Button>
    </div>
  );
}
