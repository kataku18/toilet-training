import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useRewards } from "@/hooks/use-rewards";
import { useProfile } from "@/hooks/use-profile";
import { AVATAR_ITEMS } from "@/constants/avatars";
import type { StickerSlot, AvatarItemCategory } from "@/types";

const STICKER_EMOJIS = {
  sat: "🚽",
  pee: "💧",
  poop: "💩",
};

const CATEGORY_LABELS: Record<AvatarItemCategory, { label: string; emoji: string }> = {
  hat: { label: "ぼうし", emoji: "🎩" },
  outfit: { label: "ふく", emoji: "👔" },
  accessory: { label: "アクセサリー", emoji: "💎" },
};

export default function StickerBookScreen() {
  const { rewardState, stickerPages, getCurrentPage } = useRewards();
  const { profile } = useProfile();
  const [showItems, setShowItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AvatarItemCategory>("hat");

  const currentPage = getCurrentPage();
  const unlockedItems = AVATAR_ITEMS.filter((item) =>
    rewardState.unlockedItems.includes(item.id)
  );

  if (showItems) {
    const filteredItems = unlockedItems.filter(
      (item) => item.category === selectedCategory
    );

    return (
      <ScreenContainer className="flex-1 px-5">
        <View className="pt-4 pb-2">
          <TouchableOpacity
            className="flex-row items-center mb-4"
            onPress={() => setShowItems(false)}
            activeOpacity={0.7}
          >
            <Text className="text-primary text-base font-bold">← シール帳にもどる</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground text-center">
            もらったアイテム
          </Text>
          <Text className="text-sm text-muted text-center mt-1">
            ぜんぶで {unlockedItems.length} こ
          </Text>
        </View>

        {/* カテゴリタブ */}
        <View className="flex-row gap-2 my-4">
          {(Object.keys(CATEGORY_LABELS) as AvatarItemCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`flex-1 py-3 rounded-2xl items-center border ${
                selectedCategory === cat
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text className="text-lg">{CATEGORY_LABELS[cat].emoji}</Text>
              <Text
                className={`text-xs font-bold mt-1 ${
                  selectedCategory === cat ? "text-white" : "text-foreground"
                }`}
              >
                {CATEGORY_LABELS[cat].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* アイテムリスト */}
        {filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-4">🔒</Text>
            <Text className="text-base text-muted text-center">
              まだ{CATEGORY_LABELS[selectedCategory].label}はないよ{"\n"}
              シール帳をかんせいさせよう！
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            numColumns={3}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            columnWrapperStyle={{ gap: 12, justifyContent: "flex-start" }}
            renderItem={({ item }) => (
              <View className="bg-surface rounded-2xl p-4 items-center border border-border" style={{ width: "30%" }}>
                <Text className="text-3xl">{item.imageKey}</Text>
                <Text className="text-xs font-bold text-foreground mt-2 text-center">
                  {item.name}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 px-5">
      {/* ヘッダー */}
      <View className="pt-4 pb-2 items-center">
        <Text className="text-2xl font-bold text-foreground">シール帳</Text>
        <Text className="text-sm text-muted mt-1">
          ぜんぶで ⭐ {rewardState.totalStickers} まい
        </Text>
      </View>

      {/* プログレスバー */}
      {currentPage && (
        <View className="bg-surface rounded-2xl p-4 my-3 border border-border">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-bold text-foreground">
              ページ {currentPage.pageNumber}
            </Text>
            <Text className="text-sm text-muted">
              {currentPage.slots.filter((s) => s.isFilled).length} / {currentPage.slots.length}
            </Text>
          </View>
          <View className="bg-border rounded-full h-3 overflow-hidden">
            <View
              className="bg-primary h-full rounded-full"
              style={{
                width: `${
                  (currentPage.slots.filter((s) => s.isFilled).length /
                    currentPage.slots.length) *
                  100
                }%`,
              }}
            />
          </View>
          <Text className="text-xs text-muted mt-2 text-center">
            あと {currentPage.slots.filter((s) => !s.isFilled).length} まいでご褒美ゲット！
          </Text>
        </View>
      )}

      {/* シール帳グリッド */}
      {currentPage && (
        <View className="flex-1 my-2">
          <FlatList
            data={currentPage.slots}
            numColumns={5}
            keyExtractor={(item) => `slot_${item.index}`}
            contentContainerStyle={{ paddingVertical: 8 }}
            columnWrapperStyle={{ justifyContent: "center", gap: 8, marginBottom: 8 }}
            renderItem={({ item }: { item: StickerSlot }) => (
              <View
                className={`w-14 h-14 rounded-full items-center justify-center ${
                  item.isFilled ? "bg-primary/10" : "bg-border/30"
                }`}
              >
                {item.isFilled && item.stickerType ? (
                  <Text className="text-2xl">
                    {STICKER_EMOJIS[item.stickerType]}
                  </Text>
                ) : (
                  <Text className="text-xl text-muted/30">○</Text>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* 完成済みページ数 */}
      {rewardState.pagesCompleted > 0 && (
        <View className="bg-success/10 rounded-2xl p-3 mb-2">
          <Text className="text-sm text-success text-center font-bold">
            🏆 かんせいしたページ: {rewardState.pagesCompleted} ページ
          </Text>
        </View>
      )}

      {/* もらったアイテムボタン */}
      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mb-4"
        onPress={() => setShowItems(true)}
        activeOpacity={0.7}
      >
        <Text className="text-white font-bold text-base">
          🎁 もらったアイテム ({unlockedItems.length})
        </Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
