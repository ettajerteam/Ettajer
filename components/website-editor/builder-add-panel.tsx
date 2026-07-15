"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Columns,
  FormInput,
  Grid3X3,
  HelpCircle,
  Image,
  Images,
  Inbox,
  LayoutGrid,
  Mail,
  Megaphone,
  Minus,
  Package,
  Puzzle,
  Quote,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Type,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  BLOCK_CATEGORIES,
  BUILDER_DRAG_MIME,
  getBlock,
  getBlockThumbnailClasses,
  getBlocksByCategory,
  getAllBlocks,
} from "@/lib/builder/block-registry";
import {
  getFavoriteBlockIds,
  getRecentBlockIds,
  toggleFavoriteBlockId,
} from "@/lib/builder/block-preferences";
import { getPageTemplateType } from "@/lib/page-layout";
import { blockAllowedOnPage } from "@/lib/builder/blocks/product-page-blocks";
import { useCentralBuilderStore } from "@/lib/builder/central-builder-store";
import type { BlockCategoryId, BlockDefinition, BlockId } from "@/lib/builder/types";
import { BuilderComponentsPanel } from "@/components/website-editor/builder-components-panel";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Box> = {
  box: Box,
  columns: Columns,
  space: Minus,
  minus: Minus,
  image: Image,
  sparkles: Sparkles,
  quote: Quote,
  help: HelpCircle,
  megaphone: Megaphone,
  mail: Mail,
  "shopping-bag": ShoppingBag,
  star: Star,
  grid: Grid3X3,
  package: Package,
  images: Images,
  video: Video,
  badge: Badge,
  form: FormInput,
  search: Search,
  inbox: Inbox,
  type: Type,
  footer: LayoutGrid,
};

type CategoryFilter = BlockCategoryId | "all" | "favorites";

interface BuilderAddPanelProps {
  onInsertBlock: (blockId: BlockId, index?: number) => void;
  onInsertComponent?: (componentId: string) => void;
}

function resolveBlockIcon(block: BlockDefinition) {
  const iconKey = block.icon as keyof typeof ICONS | undefined;
  return (iconKey && ICONS[iconKey]) || Box;
}

interface BlockCardProps {
  block: BlockDefinition;
  favorite: boolean;
  compact?: boolean;
  onInsert: (blockId: BlockId) => void;
  onToggleFavorite: (blockId: BlockId) => void;
  onDragStart: (blockId: BlockId) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function BlockCard({
  block,
  favorite,
  compact = false,
  onInsert,
  onToggleFavorite,
  onDragStart,
  onDragEnd,
}: BlockCardProps) {
  const Icon = resolveBlockIcon(block);
  const thumbnailClass = getBlockThumbnailClasses(block);

  const handleClick = () => {
    if (!block.implemented) return;
    onInsert(block.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={block.implemented ? 0 : -1}
      draggable={block.implemented}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragStart={block.implemented ? onDragStart(block.id) : undefined}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative flex overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition-all",
        block.implemented
          ? "cursor-pointer hover:border-[#007AFF]/40 hover:shadow-sm active:cursor-grabbing"
          : "cursor-default opacity-70",
        compact ? "min-w-[132px] shrink-0 flex-col" : "w-full flex-row gap-0"
      )}
      aria-label={block.implemented ? `Insert ${block.name}` : `${block.name} — coming soon`}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center bg-gradient-to-br",
          compact ? "h-[72px] w-full" : "h-[72px] w-[72px]",
          thumbnailClass
        )}
      >
        {block.thumbnail.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={block.thumbnail.value}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur-sm">
          <Icon className="h-3.5 w-3.5 text-neutral-700" />
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(block.id);
          }}
          className={cn(
            "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md transition-colors",
            favorite
              ? "bg-amber-100 text-amber-600"
              : "bg-white/90 text-neutral-400 opacity-0 backdrop-blur-sm group-hover:opacity-100 hover:text-amber-500"
          )}
          aria-label={favorite ? `Remove ${block.name} from favorites` : `Add ${block.name} to favorites`}
          aria-pressed={favorite}
        >
          <Star className={cn("h-3 w-3", favorite && "fill-current")} />
        </button>
        {!block.implemented && (
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
            Soon
          </span>
        )}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col justify-center", compact ? "p-2" : "px-3 py-2")}>
        <p className={cn("font-semibold text-neutral-900", compact ? "text-[11px]" : "text-sm")}>
          {block.name}
        </p>
        {!compact && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-neutral-500">
            {block.description}
          </p>
        )}
      </div>
    </div>
  );
}

function HorizontalBlockRow({
  title,
  blocks,
  favorites,
  onInsert,
  onToggleFavorite,
  onDragStart,
  onDragEnd,
}: {
  title: string;
  blocks: BlockDefinition[];
  favorites: Set<BlockId>;
  onInsert: (blockId: BlockId) => void;
  onToggleFavorite: (blockId: BlockId) => void;
  onDragStart: (blockId: BlockId) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{title}</p>
      <div className="editor-scroll-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            favorite={favorites.has(block.id)}
            compact
            onInsert={onInsert}
            onToggleFavorite={onToggleFavorite}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "bg-[#007AFF] text-white shadow-sm"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      )}
    >
      {children}
    </button>
  );
}

function BlockList({
  blocks,
  favorites,
  onInsert,
  onToggleFavorite,
  onDragStart,
  onDragEnd,
  grouped = false,
}: {
  blocks: BlockDefinition[];
  favorites: Set<BlockId>;
  onInsert: (blockId: BlockId) => void;
  onToggleFavorite: (blockId: BlockId) => void;
  onDragStart: (blockId: BlockId) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
  grouped?: boolean;
}) {
  if (blocks.length === 0) return null;

  if (!grouped) {
    return (
      <div className="flex flex-col gap-2">
        {blocks.map((block) => (
          <BlockCard
            key={block.id}
            block={block}
            favorite={favorites.has(block.id)}
            onInsert={onInsert}
            onToggleFavorite={onToggleFavorite}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {BLOCK_CATEGORIES.map((cat) => {
        const catBlocks = blocks.filter((b) => b.category === cat.id);
        if (catBlocks.length === 0) return null;
        return (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                {cat.label}
              </p>
              <span className="text-[10px] tabular-nums text-neutral-400">{catBlocks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {catBlocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  favorite={favorites.has(block.id)}
                  onInsert={onInsert}
                  onToggleFavorite={onToggleFavorite}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BuilderAddPanel({ onInsertBlock, onInsertComponent }: BuilderAddPanelProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [addTab, setAddTab] = useState<"blocks" | "components">("blocks");
  const [favorites, setFavorites] = useState<BlockId[]>([]);
  const [recent, setRecent] = useState<BlockId[]>([]);
  const { startDrag, endDrag, activePage } = useCentralBuilderStore();
  const pageTemplate = getPageTemplateType(activePage) ?? "home";
  const activeTab = useCentralBuilderStore((s) => s.builderSettings.activeTab);

  const refreshPreferences = useCallback(() => {
    setFavorites(getFavoriteBlockIds());
    setRecent(getRecentBlockIds());
  }, []);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences, activeTab]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const allBlocks = useMemo(
    () => getAllBlocks().filter((block) => blockAllowedOnPage(block, pageTemplate)),
    [pageTemplate]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let pool: BlockDefinition[];

    if (activeCategory === "all") {
      pool = allBlocks;
    } else if (activeCategory === "favorites") {
      pool = favorites
        .map((id) => getBlock(id))
        .filter((b): b is BlockDefinition => Boolean(b))
        .filter((b) => blockAllowedOnPage(b, pageTemplate));
    } else {
      pool = getBlocksByCategory(activeCategory).filter((b) =>
        blockAllowedOnPage(b, pageTemplate)
      );
    }

    if (!q) return pool;
    return pool.filter(
      (b) => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
    );
  }, [query, activeCategory, allBlocks, favorites, pageTemplate]);

  const recentBlocks = useMemo(
    () =>
      recent
        .map((id) => getBlock(id))
        .filter((b): b is BlockDefinition => Boolean(b))
        .filter((b) => blockAllowedOnPage(b, pageTemplate)),
    [recent, pageTemplate]
  );

  const favoriteBlocks = useMemo(
    () =>
      favorites
        .map((id) => getBlock(id))
        .filter((b): b is BlockDefinition => Boolean(b))
        .filter((b) => blockAllowedOnPage(b, pageTemplate)),
    [favorites, pageTemplate]
  );

  const showShortcuts = !query.trim() && activeCategory === "all";
  const showGrouped = showShortcuts && filtered.length > 0;

  const handleDragStart = (blockId: BlockId) => (e: React.DragEvent) => {
    e.dataTransfer.setData(BUILDER_DRAG_MIME, blockId);
    e.dataTransfer.effectAllowed = "copy";
    startDrag(blockId, "add-panel");
  };

  const handleDragEnd = () => endDrag();

  const handleInsert = (blockId: BlockId) => {
    const block = getBlock(blockId);
    if (!block?.implemented) return;
    onInsertBlock(blockId);
  };

  const handleToggleFavorite = (blockId: BlockId) => {
    setFavorites(toggleFavoriteBlockId(blockId));
  };

  return (
    <div className="editor-add-panel flex min-h-0 flex-col">
      <div className="shrink-0 space-y-3 border-b border-neutral-100 pb-3">
        <div className="flex gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => setAddTab("blocks")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              addTab === "blocks"
                ? "bg-white text-[#007AFF] shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <Box className="h-3.5 w-3.5" />
            Blocks
          </button>
          <button
            type="button"
            onClick={() => setAddTab("components")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              addTab === "components"
                ? "bg-white text-[#007AFF] shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <Puzzle className="h-3.5 w-3.5" />
            Components
          </button>
        </div>

        {addTab === "blocks" ? (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blocks…"
                className="h-8 pl-8 text-xs"
                aria-label="Search blocks"
              />
            </div>

            <div className="editor-scroll-hidden -mx-1 flex gap-1.5 overflow-x-auto px-1">
              <CategoryChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
                All
              </CategoryChip>
              <CategoryChip
                active={activeCategory === "favorites"}
                onClick={() => setActiveCategory("favorites")}
              >
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Favorites
                </span>
              </CategoryChip>
              {BLOCK_CATEGORIES.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </CategoryChip>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="editor-scroll-hidden min-h-0 flex-1 overflow-y-auto pt-3">
        {addTab === "components" && onInsertComponent ? (
          <BuilderComponentsPanel onInsertComponent={onInsertComponent} />
        ) : (
          <div className="space-y-4">
            {showShortcuts && recentBlocks.length > 0 ? (
              <HorizontalBlockRow
                title="Recently used"
                blocks={recentBlocks}
                favorites={favoriteSet}
                onInsert={handleInsert}
                onToggleFavorite={handleToggleFavorite}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ) : null}

            {showShortcuts && favoriteBlocks.length > 0 ? (
              <HorizontalBlockRow
                title="Favorites"
                blocks={favoriteBlocks}
                favorites={favoriteSet}
                onInsert={handleInsert}
                onToggleFavorite={handleToggleFavorite}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ) : null}

            <BlockList
              blocks={filtered}
              favorites={favoriteSet}
              onInsert={handleInsert}
              onToggleFavorite={handleToggleFavorite}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              grouped={showGrouped}
            />

            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 py-8 text-center text-xs text-neutral-500">
                {activeCategory === "favorites"
                  ? "No favorite blocks yet. Star a block to save it here."
                  : "No blocks match your search."}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
