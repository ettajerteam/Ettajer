export function newComponentId(): string {
  return `cmp-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function newInstanceId(): string {
  return `inst-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function newSectionIdForComponent(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}
