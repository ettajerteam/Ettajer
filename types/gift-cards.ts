export interface GiftCardItem {
  id: string;
  code: string;
  initialBalance: number;
  balance: number;
  active: boolean;
  expiresAt: string | null;
  /** UI-only design template (not persisted yet) */
  templateId?: string | null;
}
