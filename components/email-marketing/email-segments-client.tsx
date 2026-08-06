"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DEFAULT_VIP_MIN_SPENT,
  SEGMENT_FILTER_DEFS,
  emptySegmentDefinition,
  type AudienceSegmentDefinition,
  type AudienceSegmentRow,
  type SegmentFilter,
  type SegmentFilterType,
} from "@/lib/email-marketing/segment-types";

interface EmailSegmentsClientProps {
  initialSegments: AudienceSegmentRow[];
  currency: string;
}

function filterLabel(type: SegmentFilterType) {
  return SEGMENT_FILTER_DEFS.find((d) => d.type === type)?.label ?? type;
}

function defaultFilter(type: SegmentFilterType): SegmentFilter {
  switch (type) {
    case "vip_customers":
      return { type, minSpent: DEFAULT_VIP_MIN_SPENT };
    case "spent_gt":
      return { type, value: 500 };
    case "orders_gt":
      return { type, value: 2 };
    case "country":
    case "language":
    case "tag":
      return { type, values: [] };
    case "last_purchase":
    case "signup_date":
      return { type, withinDays: 30 };
    default:
      return { type } as SegmentFilter;
  }
}

export function EmailSegmentsClient({
  initialSegments,
  currency,
}: EmailSegmentsClientProps) {
  const [segments, setSegments] = useState(initialSegments);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [definition, setDefinition] = useState<AudienceSegmentDefinition>(
    emptySegmentDefinition()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setSegments(initialSegments);
  }, [initialSegments]);

  const defsByType = useMemo(
    () => new Map(SEGMENT_FILTER_DEFS.map((d) => [d.type, d])),
    []
  );

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setDefinition(emptySegmentDefinition());
    setPreviewCount(null);
  }

  function startEdit(segment: AudienceSegmentRow) {
    setEditingId(segment.id);
    setName(segment.name);
    setDescription(segment.description ?? "");
    setDefinition(segment.filters);
    setPreviewCount(segment.cachedCount);
  }

  function updateFilter(index: number, next: SegmentFilter) {
    setDefinition((prev) => ({
      ...prev,
      filters: prev.filters.map((f, i) => (i === index ? next : f)),
    }));
    setPreviewCount(null);
  }

  function addFilter(type: SegmentFilterType) {
    setDefinition((prev) => ({
      ...prev,
      filters: [...prev.filters, defaultFilter(type)],
    }));
    setPreviewCount(null);
  }

  function removeFilter(index: number) {
    setDefinition((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }));
    setPreviewCount(null);
  }

  async function handlePreview() {
    setBusy("preview");
    try {
      const res = await fetch("/api/email/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", filters: definition }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Preview failed");
      setPreviewCount(data.count as number);
      toast.success(`${data.count} matching contacts`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setBusy("save");
    try {
      if (editingId) {
        const res = await fetch("/api/email/segments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name: name.trim(),
            description: description.trim() || null,
            filters: definition,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Update failed");
        const row = data.segment as AudienceSegmentRow;
        setSegments((prev) => prev.map((s) => (s.id === row.id ? row : s)));
        toast.success("Segment updated");
        resetForm();
      } else {
        const res = await fetch("/api/email/segments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            name: name.trim(),
            description: description.trim() || null,
            filters: definition,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Create failed");
        setSegments((prev) => [data.segment as AudienceSegmentRow, ...prev]);
        toast.success("Segment created");
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    setBusy(`delete:${id}`);
    try {
      const res = await fetch(`/api/email/segments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setSegments((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
      toast.success("Segment deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function refresh() {
    setBusy("refresh");
    try {
      const res = await fetch("/api/email/segments");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Refresh failed");
      setSegments(data.segments as AudienceSegmentRow[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={busy === "refresh"}
          onClick={() => void refresh()}
          className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 disabled:opacity-50 dark:hover:text-white"
        >
          {busy === "refresh" ? "Refreshing…" : "Refresh counts"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4 rounded-2xl border border-neutral-100 p-5 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                {editingId ? "Edit segment" : "Create segment"}
              </h3>
              <p className="mt-0.5 text-[12px] text-neutral-400">
                Combine filters with match all / any
              </p>
            </div>
            {editingId ? (
              <button
                type="button"
                className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                onClick={resetForm}
              >
                New
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] text-neutral-500">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VIP Morocco"
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[13px] dark:border-white/10 dark:bg-white/[0.05]"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] text-neutral-500">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
                className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[13px] dark:border-white/10 dark:bg-white/[0.05]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-neutral-500">Match</span>
            {(["all", "any"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  setDefinition((prev) => ({ ...prev, match: mode }))
                }
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium",
                  definition.match === mode
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "bg-neutral-100 text-neutral-500 dark:bg-white/[0.06]"
                )}
              >
                {mode === "all" ? "All filters" : "Any filter"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {definition.filters.map((filter, index) => {
              const def = defsByType.get(filter.type);
              return (
                <div
                  key={`${filter.type}-${index}`}
                  className="rounded-[10px] border border-black/[0.06] p-3 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                        {filterLabel(filter.type)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        {def?.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-red-500"
                      onClick={() => removeFilter(index)}
                      aria-label="Remove filter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {filter.type === "vip_customers" ? (
                    <div className="mt-2 space-y-1">
                      <Label className="text-[10px] text-neutral-400">
                        Min spent ({currency})
                      </Label>
                      <Input
                        type="number"
                        value={filter.minSpent ?? DEFAULT_VIP_MIN_SPENT}
                        onChange={(e) =>
                          updateFilter(index, {
                            type: "vip_customers",
                            minSpent: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-[12px]"
                      />
                    </div>
                  ) : null}

                  {filter.type === "spent_gt" || filter.type === "orders_gt" ? (
                    <div className="mt-2 space-y-1">
                      <Label className="text-[10px] text-neutral-400">
                        {filter.type === "spent_gt"
                          ? `Amount (${currency})`
                          : "Orders"}
                      </Label>
                      <Input
                        type="number"
                        value={filter.value}
                        onChange={(e) =>
                          updateFilter(index, {
                            type: filter.type,
                            value: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-[12px]"
                      />
                    </div>
                  ) : null}

                  {filter.type === "country" ||
                  filter.type === "language" ||
                  filter.type === "tag" ? (
                    <div className="mt-2 space-y-1">
                      <Label className="text-[10px] text-neutral-400">
                        Values (comma-separated)
                      </Label>
                      <Input
                        value={filter.values.join(", ")}
                        onChange={(e) =>
                          updateFilter(index, {
                            type: filter.type,
                            values: e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder={
                          filter.type === "country"
                            ? "MA, FR"
                            : filter.type === "language"
                              ? "en, fr, ar"
                              : "vip, wholesale"
                        }
                        className="h-8 text-[12px]"
                      />
                    </div>
                  ) : null}

                  {filter.type === "last_purchase" ||
                  filter.type === "signup_date" ? (
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400">
                          Within days
                        </Label>
                        <Input
                          type="number"
                          value={filter.withinDays ?? ""}
                          onChange={(e) =>
                            updateFilter(index, {
                              ...filter,
                              withinDays: e.target.value
                                ? Number(e.target.value)
                                : null,
                            })
                          }
                          className="h-8 text-[12px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400">
                          After
                        </Label>
                        <Input
                          type="date"
                          value={filter.after?.slice(0, 10) ?? ""}
                          onChange={(e) =>
                            updateFilter(index, {
                              ...filter,
                              after: e.target.value || null,
                            })
                          }
                          className="h-8 text-[12px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-neutral-400">
                          Before
                        </Label>
                        <Input
                          type="date"
                          value={filter.before?.slice(0, 10) ?? ""}
                          onChange={(e) =>
                            updateFilter(index, {
                              ...filter,
                              before: e.target.value || null,
                            })
                          }
                          className="h-8 text-[12px]"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SEGMENT_FILTER_DEFS.map((def) => (
              <button
                key={def.type}
                type="button"
                onClick={() => addFilter(def.type)}
                className="inline-flex items-center gap-1 rounded-md border border-black/[0.06] px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-[#F5F5F7] dark:border-white/10 dark:text-neutral-300"
              >
                <Plus className="h-3 w-3" />
                {def.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-3 dark:border-white/10">
            <p className="text-[12px] text-neutral-500">
              {previewCount != null ? (
                <>
                  <span className="font-semibold tabular-nums text-neutral-900 dark:text-white">
                    {previewCount.toLocaleString()}
                  </span>{" "}
                  matching contacts
                </>
              ) : (
                "Preview to estimate size"
              )}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-full px-3 text-[12px]"
                loading={busy === "preview"}
                disabled={busy !== null || definition.filters.length === 0}
                onClick={() => void handlePreview()}
              >
                Preview
              </Button>
              <Button
                type="button"
                className="h-8 rounded-full bg-neutral-950 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
                loading={busy === "save"}
                disabled={busy !== null || !name.trim()}
                onClick={() => void handleSave()}
              >
                {editingId ? "Update segment" : "Save segment"}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-100 dark:border-white/10">
          <div className="border-b border-neutral-100 px-4 py-3.5 dark:border-white/10">
            <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              Your segments
            </h3>
            <p className="mt-0.5 text-[12px] text-neutral-400">
              Counts refresh automatically (and on send)
            </p>
          </div>
          {segments.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-[13px] font-medium text-neutral-950 dark:text-white">
                No segments yet
              </p>
              <p className="mt-1 text-[12px] text-neutral-400">
                Create VIP, never purchased, or country segments to target
                campaigns.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-white/10">
              {segments.map((segment) => (
                <li
                  key={segment.id}
                  className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-neutral-950 dark:text-white">
                      {segment.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-neutral-400">
                      {segment.cachedCount.toLocaleString()} contacts
                      {" · "}
                      {segment.filters.filters
                        .map((f) => filterLabel(f.type))
                        .join(
                          segment.filters.match === "any" ? " or " : " + "
                        )}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="text-[12px] font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      onClick={() => startEdit(segment)}
                    >
                      Edit
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-0 text-[12px] font-medium text-red-600 hover:bg-transparent hover:text-red-700"
                      loading={busy === `delete:${segment.id}`}
                      onClick={() => void handleDelete(segment.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
