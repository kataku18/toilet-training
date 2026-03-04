import { describe, it, expect } from "vitest";
import {
  STICKER_REWARDS,
  INITIAL_STICKERS_PER_PAGE,
  RECORD_TYPE_LABELS,
  REACTION_LABELS,
} from "../types";
import type {
  UserProfile,
  ToiletRecord,
  RewardState,
  RecordType,
  Gender,
  TimelinePost,
  ReactionType,
} from "../types";

describe("Types and Constants", () => {
  describe("STICKER_REWARDS", () => {
    it("should award 1 sticker for sitting", () => {
      expect(STICKER_REWARDS.sat).toBe(1);
    });

    it("should award 2 stickers for pee", () => {
      expect(STICKER_REWARDS.pee).toBe(2);
    });

    it("should award 3 stickers for poop", () => {
      expect(STICKER_REWARDS.poop).toBe(3);
    });
  });

  describe("INITIAL_STICKERS_PER_PAGE", () => {
    it("should be 5 for easy early completion", () => {
      expect(INITIAL_STICKERS_PER_PAGE).toBe(5);
    });
  });

  describe("RECORD_TYPE_LABELS", () => {
    it("should have labels for all record types", () => {
      const types: RecordType[] = ["sat", "pee", "poop"];
      types.forEach((type) => {
        expect(RECORD_TYPE_LABELS[type]).toBeDefined();
        expect(typeof RECORD_TYPE_LABELS[type]).toBe("string");
        expect(RECORD_TYPE_LABELS[type].length).toBeGreaterThan(0);
      });
    });
  });

  describe("REACTION_LABELS", () => {
    it("should have labels and emojis for all reaction types", () => {
      const types: ReactionType[] = ["amazing", "great_job", "hooray"];
      types.forEach((type) => {
        expect(REACTION_LABELS[type]).toBeDefined();
        expect(REACTION_LABELS[type].label).toBeDefined();
        expect(REACTION_LABELS[type].emoji).toBeDefined();
      });
    });
  });

  describe("UserProfile type structure", () => {
    it("should create a valid profile object", () => {
      const profile: UserProfile = {
        nickname: "テストくん",
        gender: "boy",
        ageMonths: 24,
        avatarId: "avatar_bear",
        equippedItems: { hat: null, outfit: null, accessory: null },
        isTimelineEnabled: false,
        isOnboardingComplete: false,
        createdAt: new Date().toISOString(),
      };

      expect(profile.nickname).toBe("テストくん");
      expect(profile.gender).toBe("boy");
      expect(profile.ageMonths).toBe(24);
      expect(profile.equippedItems.hat).toBeNull();
    });
  });

  describe("ToiletRecord type structure", () => {
    it("should create a valid record object", () => {
      const record: ToiletRecord = {
        id: "test_123",
        type: "poop",
        timestamp: new Date().toISOString(),
        stickersEarned: 3,
      };

      expect(record.type).toBe("poop");
      expect(record.stickersEarned).toBe(3);
    });
  });

  describe("RewardState type structure", () => {
    it("should create a valid reward state", () => {
      const state: RewardState = {
        totalStickers: 10,
        currentPageStickers: 3,
        stickersPerPage: 5,
        pagesCompleted: 1,
        unlockedItems: ["hat_crown"],
      };

      expect(state.totalStickers).toBe(10);
      expect(state.pagesCompleted).toBe(1);
      expect(state.unlockedItems).toContain("hat_crown");
    });
  });
});
