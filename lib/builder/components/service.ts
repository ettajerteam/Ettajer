import { prisma } from "@/lib/db";
import type { BuilderComponent, ComponentRoot } from "@/lib/builder/components";
import type { StoreSection } from "@/lib/sections/types";

function normalizeComponentRoot(raw: unknown): ComponentRoot {
  if (Array.isArray(raw)) {
    return { kind: "sections", sections: raw as StoreSection[] };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as { kind?: string; sections?: unknown };
    if (Array.isArray(obj.sections)) {
      return { kind: "sections", sections: obj.sections as StoreSection[] };
    }
    if (obj.kind === "element") {
      return raw as ComponentRoot;
    }
  }
  return { kind: "sections", sections: [] };
}

function rowToComponent(row: {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  category: string | null;
  thumbnail: string | null;
  root: unknown;
  version: number;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}): BuilderComponent {
  return {
    id: row.id,
    storeId: row.storeId,
    name: row.name,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    root: normalizeComponentRoot(row.root),
    version: row.version,
    metadata: (row.metadata as BuilderComponent["metadata"]) ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listBuilderComponents(storeId: string): Promise<BuilderComponent[]> {
  const rows = await prisma.builderComponent.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(rowToComponent);
}

export async function getBuilderComponent(
  storeId: string,
  id: string
): Promise<BuilderComponent | null> {
  const row = await prisma.builderComponent.findFirst({
    where: { id, storeId },
  });
  return row ? rowToComponent(row) : null;
}

export async function createBuilderComponent(
  component: BuilderComponent
): Promise<BuilderComponent> {
  const row = await prisma.builderComponent.create({
    data: {
      id: component.id,
      storeId: component.storeId,
      name: component.name,
      description: component.description,
      category: component.category,
      thumbnail: component.thumbnail,
      root: component.root as object,
      version: component.version,
      metadata: component.metadata ? (component.metadata as object) : undefined,
    },
  });
  return rowToComponent(row);
}

export async function updateBuilderComponent(
  storeId: string,
  id: string,
  patch: Partial<
    Pick<BuilderComponent, "name" | "description" | "category" | "thumbnail" | "root" | "metadata">
  >
): Promise<BuilderComponent | null> {
  const existing = await prisma.builderComponent.findFirst({ where: { id, storeId } });
  if (!existing) return null;

  const row = await prisma.builderComponent.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.thumbnail !== undefined ? { thumbnail: patch.thumbnail } : {}),
      ...(patch.root !== undefined ? { root: patch.root as object } : {}),
      ...(patch.metadata !== undefined ? { metadata: patch.metadata as object } : {}),
      ...(patch.root !== undefined ? { version: existing.version + 1 } : {}),
    },
  });
  return rowToComponent(row);
}

export async function deleteBuilderComponent(storeId: string, id: string): Promise<boolean> {
  const existing = await prisma.builderComponent.findFirst({ where: { id, storeId } });
  if (!existing) return false;
  await prisma.builderComponent.delete({ where: { id } });
  return true;
}
