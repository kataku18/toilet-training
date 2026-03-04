import { View, Text } from "react-native";
import { BASE_AVATARS, AVATAR_ITEMS } from "@/constants/avatars";
import type { EquippedItems } from "@/types";

interface AvatarDisplayProps {
  avatarId: string;
  equippedItems: EquippedItems;
  size?: "small" | "medium" | "large";
}

const SIZE_MAP = {
  small: { container: 48, emoji: 24, item: 14 },
  medium: { container: 80, emoji: 40, item: 20 },
  large: { container: 120, emoji: 60, item: 28 },
};

export function AvatarDisplay({
  avatarId,
  equippedItems,
  size = "medium",
}: AvatarDisplayProps) {
  const avatar = BASE_AVATARS.find((a) => a.id === avatarId);
  const dimensions = SIZE_MAP[size];

  const hatItem = equippedItems.hat
    ? AVATAR_ITEMS.find((i) => i.id === equippedItems.hat)
    : null;
  const outfitItem = equippedItems.outfit
    ? AVATAR_ITEMS.find((i) => i.id === equippedItems.outfit)
    : null;
  const accItem = equippedItems.accessory
    ? AVATAR_ITEMS.find((i) => i.id === equippedItems.accessory)
    : null;

  return (
    <View
      className="items-center justify-center bg-surface rounded-full border-2 border-border relative"
      style={{ width: dimensions.container, height: dimensions.container }}
    >
      {/* 帽子（上部） */}
      {hatItem && (
        <View
          className="absolute z-10"
          style={{ top: -dimensions.item * 0.5, right: -2 }}
        >
          <Text style={{ fontSize: dimensions.item }}>{hatItem.imageKey}</Text>
        </View>
      )}

      {/* メインアバター */}
      <Text style={{ fontSize: dimensions.emoji }}>{avatar?.emoji ?? "🐻"}</Text>

      {/* 服（左下） */}
      {outfitItem && (
        <View
          className="absolute z-10"
          style={{ bottom: -2, left: -dimensions.item * 0.3 }}
        >
          <Text style={{ fontSize: dimensions.item }}>{outfitItem.imageKey}</Text>
        </View>
      )}

      {/* アクセサリー（右下） */}
      {accItem && (
        <View
          className="absolute z-10"
          style={{ bottom: -2, right: -dimensions.item * 0.3 }}
        >
          <Text style={{ fontSize: dimensions.item }}>{accItem.imageKey}</Text>
        </View>
      )}
    </View>
  );
}
