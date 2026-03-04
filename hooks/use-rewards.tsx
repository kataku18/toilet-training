import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";
import { pickRandomLockedItem } from "@/constants/avatars";
import type { RewardState, RecordType, StickerPage, StickerSlot, AvatarItem, Gender } from "@/types";
import { STICKER_REWARDS, INITIAL_STICKERS_PER_PAGE } from "@/types";

const DEFAULT_REWARD_STATE: RewardState = {
  totalStickers: 0,
  currentPageStickers: 0,
  stickersPerPage: INITIAL_STICKERS_PER_PAGE,
  pagesCompleted: 0,
  unlockedItems: [],
};

interface RewardResult {
  stickersEarned: number;
  pageCompleted: boolean;
  newItem: AvatarItem | null;
}

interface RewardsContextValue {
  rewardState: RewardState;
  stickerPages: StickerPage[];
  isLoading: boolean;
  addStickers: (recordType: RecordType, gender: Gender) => Promise<RewardResult>;
  getCurrentPage: () => StickerPage | null;
  resetRewards: () => Promise<void>;
}

const RewardsContext = createContext<RewardsContextValue | null>(null);

function createEmptyPage(pageNumber: number, slotsCount: number): StickerPage {
  const slots: StickerSlot[] = Array.from({ length: slotsCount }, (_, i) => ({
    index: i,
    isFilled: false,
    stickerType: null,
    filledAt: null,
  }));
  return { pageNumber, slots, isComplete: false };
}

/**
 * シール帳のページ数に応じてスロット数を増加させる
 * 初期: 5枚 → 2ページ目: 6枚 → 3ページ目: 7枚 → 最大10枚
 */
function getStickersPerPage(pagesCompleted: number): number {
  return Math.min(INITIAL_STICKERS_PER_PAGE + pagesCompleted, 10);
}

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [rewardState, setRewardState] = useState<RewardState>(DEFAULT_REWARD_STATE);
  const [stickerPages, setStickerPages] = useState<StickerPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      const savedState = await storage.load<RewardState>(storage.keys.REWARD_STATE);
      const savedPages = await storage.load<StickerPage[]>(storage.keys.STICKER_PAGES);

      if (savedState) setRewardState(savedState);
      if (savedPages && savedPages.length > 0) {
        setStickerPages(savedPages);
      } else {
        const firstPage = createEmptyPage(1, INITIAL_STICKERS_PER_PAGE);
        setStickerPages([firstPage]);
        await storage.save(storage.keys.STICKER_PAGES, [firstPage]);
      }
    } catch (error) {
      console.error("[Rewards] Failed to load:", error);
      const firstPage = createEmptyPage(1, INITIAL_STICKERS_PER_PAGE);
      setStickerPages([firstPage]);
    } finally {
      setIsLoading(false);
    }
  }

  const getCurrentPage = useCallback((): StickerPage | null => {
    if (stickerPages.length === 0) return null;
    return stickerPages[stickerPages.length - 1];
  }, [stickerPages]);

  const addStickers = useCallback(
    async (recordType: RecordType, gender: Gender): Promise<RewardResult> => {
      const earned = STICKER_REWARDS[recordType];
      let pageCompleted = false;
      let newItem: AvatarItem | null = null;

      setStickerPages((prevPages) => {
        const pages = [...prevPages];
        let currentPage = { ...pages[pages.length - 1] };
        const slots = [...currentPage.slots];

        let remaining = earned;
        for (let i = 0; i < slots.length && remaining > 0; i++) {
          if (!slots[i].isFilled) {
            slots[i] = {
              ...slots[i],
              isFilled: true,
              stickerType: recordType,
              filledAt: new Date().toISOString(),
            };
            remaining--;
          }
        }

        currentPage.slots = slots;
        const allFilled = slots.every((s) => s.isFilled);
        if (allFilled) {
          currentPage.isComplete = true;
          pageCompleted = true;
        }
        pages[pages.length - 1] = currentPage;

        if (pageCompleted) {
          const nextSlotsCount = getStickersPerPage(pages.length);
          const nextPage = createEmptyPage(pages.length + 1, nextSlotsCount);
          pages.push(nextPage);
        }

        storage.save(storage.keys.STICKER_PAGES, pages);
        return pages;
      });

      setRewardState((prev) => {
        const newPagesCompleted = pageCompleted
          ? prev.pagesCompleted + 1
          : prev.pagesCompleted;
        const newStickersPerPage = getStickersPerPage(newPagesCompleted);

        if (pageCompleted) {
          newItem = pickRandomLockedItem(gender, prev.unlockedItems);
        }

        const next: RewardState = {
          totalStickers: prev.totalStickers + earned,
          currentPageStickers: pageCompleted ? 0 : prev.currentPageStickers + earned,
          stickersPerPage: newStickersPerPage,
          pagesCompleted: newPagesCompleted,
          unlockedItems: newItem
            ? [...prev.unlockedItems, newItem.id]
            : prev.unlockedItems,
        };

        storage.save(storage.keys.REWARD_STATE, next);
        if (newItem) {
          storage.save(storage.keys.UNLOCKED_ITEMS, next.unlockedItems);
        }

        return next;
      });

      return { stickersEarned: earned, pageCompleted, newItem };
    },
    []
  );

  const resetRewards = useCallback(async () => {
    const fresh = { ...DEFAULT_REWARD_STATE };
    const firstPage = createEmptyPage(1, INITIAL_STICKERS_PER_PAGE);
    setRewardState(fresh);
    setStickerPages([firstPage]);
    await storage.save(storage.keys.REWARD_STATE, fresh);
    await storage.save(storage.keys.STICKER_PAGES, [firstPage]);
    await storage.save(storage.keys.UNLOCKED_ITEMS, []);
  }, []);

  return (
    <RewardsContext.Provider
      value={{
        rewardState,
        stickerPages,
        isLoading,
        addStickers,
        getCurrentPage,
        resetRewards,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards(): RewardsContextValue {
  const ctx = useContext(RewardsContext);
  if (!ctx) {
    throw new Error("useRewards must be used within a RewardsProvider");
  }
  return ctx;
}
