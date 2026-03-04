import { describe, it, expect } from "vitest";
import {
  BASE_AVATARS,
  AVATAR_ITEMS,
  getItemsForGender,
  getItemsByCategory,
  pickRandomLockedItem,
} from "../constants/avatars";

describe("Avatars", () => {
  describe("BASE_AVATARS", () => {
    it("should have 6 base avatars", () => {
      expect(BASE_AVATARS).toHaveLength(6);
    });

    it("should have unique IDs", () => {
      const ids = BASE_AVATARS.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should all have emoji and name", () => {
      BASE_AVATARS.forEach((avatar) => {
        expect(avatar.emoji).toBeDefined();
        expect(avatar.name).toBeDefined();
        expect(avatar.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("AVATAR_ITEMS", () => {
    it("should have items in all categories", () => {
      const categories = new Set(AVATAR_ITEMS.map((i) => i.category));
      expect(categories).toContain("hat");
      expect(categories).toContain("outfit");
      expect(categories).toContain("accessory");
    });

    it("should have unique IDs", () => {
      const ids = AVATAR_ITEMS.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("should all start as locked", () => {
      AVATAR_ITEMS.forEach((item) => {
        expect(item.isUnlocked).toBe(false);
        expect(item.unlockedAt).toBeNull();
      });
    });
  });

  describe("getItemsForGender", () => {
    it("should return items for boys including all-gender items", () => {
      const boyItems = getItemsForGender("boy");
      boyItems.forEach((item) => {
        expect(["all", "boy"]).toContain(item.genderTarget);
      });
      expect(boyItems.length).toBeGreaterThan(0);
    });

    it("should return items for girls including all-gender items", () => {
      const girlItems = getItemsForGender("girl");
      girlItems.forEach((item) => {
        expect(["all", "girl"]).toContain(item.genderTarget);
      });
      expect(girlItems.length).toBeGreaterThan(0);
    });

    it("should not return boy-only items for girls", () => {
      const girlItems = getItemsForGender("girl");
      const boyOnlyIds = AVATAR_ITEMS.filter((i) => i.genderTarget === "boy").map((i) => i.id);
      girlItems.forEach((item) => {
        expect(boyOnlyIds).not.toContain(item.id);
      });
    });
  });

  describe("getItemsByCategory", () => {
    it("should filter items by hat category", () => {
      const hats = getItemsByCategory(AVATAR_ITEMS, "hat");
      hats.forEach((item) => {
        expect(item.category).toBe("hat");
      });
      expect(hats.length).toBeGreaterThan(0);
    });

    it("should filter items by outfit category", () => {
      const outfits = getItemsByCategory(AVATAR_ITEMS, "outfit");
      outfits.forEach((item) => {
        expect(item.category).toBe("outfit");
      });
      expect(outfits.length).toBeGreaterThan(0);
    });
  });

  describe("pickRandomLockedItem", () => {
    it("should return an item when items are available", () => {
      const item = pickRandomLockedItem("boy", []);
      expect(item).not.toBeNull();
      expect(["all", "boy"]).toContain(item!.genderTarget);
    });

    it("should not return already unlocked items", () => {
      const allBoyItems = getItemsForGender("boy");
      const unlockedIds = allBoyItems.slice(0, 3).map((i) => i.id);
      const item = pickRandomLockedItem("boy", unlockedIds);
      if (item) {
        expect(unlockedIds).not.toContain(item.id);
      }
    });

    it("should return null when all items are unlocked", () => {
      const allIds = AVATAR_ITEMS.map((i) => i.id);
      const item = pickRandomLockedItem("boy", allIds);
      expect(item).toBeNull();
    });
  });
});
