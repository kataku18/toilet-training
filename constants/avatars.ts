import type { Gender, AvatarItem, AvatarItemCategory } from "@/types";

export interface AvatarBase {
  id: string;
  name: string;
  emoji: string;
  genderTarget: Gender | "all";
}

/**
 * 初期選択可能なアバター（6種類）
 */
export const BASE_AVATARS: AvatarBase[] = [
  { id: "avatar_bear", name: "くまさん", emoji: "🐻", genderTarget: "all" },
  { id: "avatar_rabbit", name: "うさぎさん", emoji: "🐰", genderTarget: "all" },
  { id: "avatar_cat", name: "ねこさん", emoji: "🐱", genderTarget: "all" },
  { id: "avatar_dog", name: "いぬさん", emoji: "🐶", genderTarget: "all" },
  { id: "avatar_panda", name: "パンダさん", emoji: "🐼", genderTarget: "all" },
  { id: "avatar_penguin", name: "ペンギンさん", emoji: "🐧", genderTarget: "all" },
];

/**
 * アバター着せ替えアイテム
 * シール帳完成時にランダムで1つ付与される
 */
export const AVATAR_ITEMS: AvatarItem[] = [
  // 帽子
  { id: "hat_crown", name: "おうかん", category: "hat", genderTarget: "all", imageKey: "👑", isUnlocked: false, unlockedAt: null },
  { id: "hat_ribbon", name: "リボン", category: "hat", genderTarget: "girl", imageKey: "🎀", isUnlocked: false, unlockedAt: null },
  { id: "hat_cap", name: "キャップ", category: "hat", genderTarget: "boy", imageKey: "🧢", isUnlocked: false, unlockedAt: null },
  { id: "hat_flower", name: "おはな", category: "hat", genderTarget: "girl", imageKey: "🌸", isUnlocked: false, unlockedAt: null },
  { id: "hat_star", name: "おほし", category: "hat", genderTarget: "all", imageKey: "⭐", isUnlocked: false, unlockedAt: null },
  { id: "hat_wizard", name: "まほうつかい", category: "hat", genderTarget: "all", imageKey: "🧙", isUnlocked: false, unlockedAt: null },

  // 服
  { id: "outfit_hero", name: "ヒーロー", category: "outfit", genderTarget: "boy", imageKey: "🦸", isUnlocked: false, unlockedAt: null },
  { id: "outfit_princess", name: "プリンセス", category: "outfit", genderTarget: "girl", imageKey: "👸", isUnlocked: false, unlockedAt: null },
  { id: "outfit_astronaut", name: "うちゅうひこうし", category: "outfit", genderTarget: "all", imageKey: "🧑‍🚀", isUnlocked: false, unlockedAt: null },
  { id: "outfit_chef", name: "コックさん", category: "outfit", genderTarget: "all", imageKey: "👨‍🍳", isUnlocked: false, unlockedAt: null },
  { id: "outfit_pirate", name: "かいぞく", category: "outfit", genderTarget: "boy", imageKey: "🏴‍☠️", isUnlocked: false, unlockedAt: null },
  { id: "outfit_fairy", name: "ようせい", category: "outfit", genderTarget: "girl", imageKey: "🧚", isUnlocked: false, unlockedAt: null },

  // アクセサリー
  { id: "acc_sunglasses", name: "サングラス", category: "accessory", genderTarget: "all", imageKey: "🕶️", isUnlocked: false, unlockedAt: null },
  { id: "acc_magic_wand", name: "まほうのつえ", category: "accessory", genderTarget: "all", imageKey: "🪄", isUnlocked: false, unlockedAt: null },
  { id: "acc_shield", name: "たて", category: "accessory", genderTarget: "boy", imageKey: "🛡️", isUnlocked: false, unlockedAt: null },
  { id: "acc_heart", name: "ハート", category: "accessory", genderTarget: "girl", imageKey: "💖", isUnlocked: false, unlockedAt: null },
  { id: "acc_rainbow", name: "にじ", category: "accessory", genderTarget: "all", imageKey: "🌈", isUnlocked: false, unlockedAt: null },
  { id: "acc_medal", name: "メダル", category: "accessory", genderTarget: "all", imageKey: "🏅", isUnlocked: false, unlockedAt: null },
];

/**
 * 性別に応じたアイテムをフィルタリング
 */
export function getItemsForGender(gender: Gender): AvatarItem[] {
  return AVATAR_ITEMS.filter(
    (item) => item.genderTarget === "all" || item.genderTarget === gender
  );
}

/**
 * カテゴリ別にアイテムを取得
 */
export function getItemsByCategory(
  items: AvatarItem[],
  category: AvatarItemCategory
): AvatarItem[] {
  return items.filter((item) => item.category === category);
}

/**
 * ランダムに未解放アイテムを1つ選ぶ
 */
export function pickRandomLockedItem(
  gender: Gender,
  unlockedIds: string[]
): AvatarItem | null {
  const available = getItemsForGender(gender).filter(
    (item) => !unlockedIds.includes(item.id)
  );
  if (available.length === 0) return null;
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}
