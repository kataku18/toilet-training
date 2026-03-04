import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { useProfile } from "@/hooks/use-profile";
import { useRewards } from "@/hooks/use-rewards";
import { AVATAR_ITEMS, BASE_AVATARS } from "@/constants/avatars";
import type { AvatarItemCategory, EquippedItems } from "@/types";

const CATEGORY_TABS: { key: AvatarItemCategory; label: string; emoji: string }[] = [
  { key: "hat", label: "ぼうし", emoji: "🎩" },
  { key: "outfit", label: "ふく", emoji: "👔" },
  { key: "accessory", label: "アクセサリー", emoji: "💎" },
];

export default function ProfileScreen() {
  const { profile, updateProfile, updateEquippedItems } = useProfile();
  const { rewardState } = useRewards();
  const [showDressUp, setShowDressUp] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AvatarItemCategory>("hat");
  const [previewItems, setPreviewItems] = useState<EquippedItems>(profile.equippedItems);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);

  const unlockedItems = AVATAR_ITEMS.filter((item) =>
    rewardState.unlockedItems.includes(item.id)
  );

  function openDressUp() {
    setPreviewItems({ ...profile.equippedItems });
    setShowDressUp(true);
  }

  function handleItemSelect(itemId: string, category: AvatarItemCategory) {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPreviewItems((prev) => ({
      ...prev,
      [category]: prev[category] === itemId ? null : itemId,
    }));
  }

  async function handleSaveDressUp() {
    await updateEquippedItems(previewItems);
    setShowDressUp(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function handleSaveNickname() {
    const sanitized = nicknameInput
      .trim()
      .replace(/<[^>]*>/g, "")
      .replace(/[&<>"']/g, "")
      .substring(0, 10);
    if (sanitized.length > 0) {
      await updateProfile({ nickname: sanitized });
    }
    setEditingNickname(false);
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* ヘッダー */}
        <View className="items-center pt-4 pb-6">
          <Text className="text-2xl font-bold text-foreground mb-4">せってい</Text>

          {/* アバター */}
          <AvatarDisplay
            avatarId={profile.avatarId}
            equippedItems={profile.equippedItems}
            size="large"
          />

          <TouchableOpacity
            className="bg-primary px-6 py-2 rounded-2xl mt-4"
            onPress={openDressUp}
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-sm">👗 きせかえ</Text>
          </TouchableOpacity>
        </View>

        {/* プロフィール設定 */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-base font-bold text-foreground mb-3">プロフィール</Text>

          {/* ニックネーム */}
          <View className="flex-row items-center justify-between py-3 border-b border-border">
            <Text className="text-sm text-muted">ニックネーム</Text>
            {editingNickname ? (
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="bg-background border border-border rounded-lg px-3 py-1 text-sm text-foreground"
                  value={nicknameInput}
                  onChangeText={(t) => setNicknameInput(t.substring(0, 10))}
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveNickname}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveNickname}>
                  <Text className="text-primary font-bold text-sm">ほぞん</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setNicknameInput(profile.nickname);
                  setEditingNickname(true);
                }}
              >
                <Text className="text-sm text-foreground">{profile.nickname} ✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 性別 */}
          <View className="flex-row items-center justify-between py-3 border-b border-border">
            <Text className="text-sm text-muted">せいべつ</Text>
            <Text className="text-sm text-foreground">
              {profile.gender === "boy" ? "👦 おとこのこ" : profile.gender === "girl" ? "👧 おんなのこ" : "未設定"}
            </Text>
          </View>

          {/* 年齢 */}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm text-muted">ねんれい</Text>
            <Text className="text-sm text-foreground">
              {profile.ageMonths >= 12
                ? `${Math.floor(profile.ageMonths / 12)}さい${
                    profile.ageMonths % 12 >= 6 ? "はん" : ""
                  }`
                : `${profile.ageMonths}かげつ`}
            </Text>
          </View>
        </View>

        {/* タイムライン設定 */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
          <Text className="text-base font-bold text-foreground mb-3">タイムライン</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-sm text-foreground">みんなにシェア</Text>
              <Text className="text-xs text-muted mt-1">
                トイレきろくをタイムラインにとうこうします
              </Text>
            </View>
            <Switch
              value={profile.isTimelineEnabled}
              onValueChange={(value) => updateProfile({ isTimelineEnabled: value })}
              trackColor={{ false: "#E8DDD0", true: "#FF8C42" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* アプリ情報 */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-base font-bold text-foreground mb-3">アプリじょうほう</Text>
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-sm text-muted">バージョン</Text>
            <Text className="text-sm text-foreground">1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* 着せ替えモーダル */}
      <Modal
        visible={showDressUp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDressUp(false)}
      >
        <View className="flex-1 bg-background">
          <View className="px-5 pt-6 pb-4">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => setShowDressUp(false)}>
                <Text className="text-primary font-bold text-base">キャンセル</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-foreground">きせかえ</Text>
              <TouchableOpacity onPress={handleSaveDressUp}>
                <Text className="text-primary font-bold text-base">ほぞん</Text>
              </TouchableOpacity>
            </View>

            {/* プレビュー */}
            <View className="items-center py-6">
              <AvatarDisplay
                avatarId={profile.avatarId}
                equippedItems={previewItems}
                size="large"
              />
            </View>

            {/* カテゴリタブ */}
            <View className="flex-row gap-2 mb-4">
              {CATEGORY_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  className={`flex-1 py-3 rounded-2xl items-center border ${
                    selectedCategory === tab.key
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                  onPress={() => setSelectedCategory(tab.key)}
                  activeOpacity={0.7}
                >
                  <Text className="text-lg">{tab.emoji}</Text>
                  <Text
                    className={`text-xs font-bold mt-1 ${
                      selectedCategory === tab.key ? "text-white" : "text-foreground"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* アイテムリスト */}
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            <View className="flex-row flex-wrap gap-3">
              {/* はずすボタン */}
              <TouchableOpacity
                className={`p-4 rounded-2xl items-center border-2 ${
                  previewItems[selectedCategory] === null
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface"
                }`}
                style={{ width: "30%" }}
                onPress={() =>
                  setPreviewItems((prev) => ({
                    ...prev,
                    [selectedCategory]: null,
                  }))
                }
                activeOpacity={0.7}
              >
                <Text className="text-2xl">❌</Text>
                <Text className="text-xs font-bold text-foreground mt-1">はずす</Text>
              </TouchableOpacity>

              {unlockedItems
                .filter((item) => item.category === selectedCategory)
                .map((item) => {
                  const isSelected = previewItems[selectedCategory] === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      className={`p-4 rounded-2xl items-center border-2 ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface"
                      }`}
                      style={{ width: "30%" }}
                      onPress={() => handleItemSelect(item.id, selectedCategory)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-2xl">{item.imageKey}</Text>
                      <Text className="text-xs font-bold text-foreground mt-1 text-center">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

              {unlockedItems.filter((item) => item.category === selectedCategory)
                .length === 0 && (
                <View className="w-full items-center py-10">
                  <Text className="text-3xl mb-2">🔒</Text>
                  <Text className="text-sm text-muted text-center">
                    まだアイテムがないよ{"\n"}
                    シール帳をかんせいさせよう！
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
