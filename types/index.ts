// ===== ユーザープロフィール =====

export type Gender = "boy" | "girl" | "unset";

export interface UserProfile {
  nickname: string;
  gender: Gender;
  ageMonths: number;
  avatarId: string;
  equippedItems: EquippedItems;
  isTimelineEnabled: boolean;
  isOnboardingComplete: boolean;
  createdAt: string;
}

export interface EquippedItems {
  hat: string | null;
  outfit: string | null;
  accessory: string | null;
}

// ===== トイレ記録 =====

export type RecordType = "sat" | "pee" | "poop";

export interface ToiletRecord {
  id: string;
  type: RecordType;
  timestamp: string;
  stickersEarned: number;
}

// ===== シール＆ご褒美 =====

export interface StickerPage {
  pageNumber: number;
  slots: StickerSlot[];
  isComplete: boolean;
}

export interface StickerSlot {
  index: number;
  isFilled: boolean;
  stickerType: RecordType | null;
  filledAt: string | null;
}

export interface AvatarItem {
  id: string;
  name: string;
  category: AvatarItemCategory;
  genderTarget: Gender | "all";
  imageKey: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export type AvatarItemCategory = "hat" | "outfit" | "accessory";

export interface RewardState {
  totalStickers: number;
  currentPageStickers: number;
  stickersPerPage: number;
  pagesCompleted: number;
  unlockedItems: string[];
}

// ===== ソーシャルタイムライン =====

export interface TimelinePost {
  id: string;
  nickname: string;
  avatarId: string;
  equippedItems: EquippedItems;
  recordType: RecordType;
  message: string;
  timestamp: string;
  reactions: ReactionCount[];
}

export type ReactionType = "amazing" | "great_job" | "hooray";

export interface ReactionCount {
  type: ReactionType;
  count: number;
}

// ===== 定数 =====

export const STICKER_REWARDS: Record<RecordType, number> = {
  sat: 1,
  pee: 2,
  poop: 3,
};

export const INITIAL_STICKERS_PER_PAGE = 5;

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  sat: "べんざにすわれた",
  pee: "おしっこできた",
  poop: "うんちできた",
};

export const REACTION_LABELS: Record<ReactionType, { label: string; emoji: string }> = {
  amazing: { label: "すごい！", emoji: "👏" },
  great_job: { label: "がんばったね！", emoji: "💪" },
  hooray: { label: "やったね！", emoji: "🎉" },
};
