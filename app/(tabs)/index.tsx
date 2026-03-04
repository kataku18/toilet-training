import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Platform, Modal } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { useProfile } from "@/hooks/use-profile";
import { useRecords } from "@/hooks/use-records";
import { useRewards } from "@/hooks/use-rewards";
import { useTimeline } from "@/hooks/use-timeline";
import type { RecordType, AvatarItem } from "@/types";
import { RECORD_TYPE_LABELS } from "@/types";

const RECORD_BUTTONS: {
  type: RecordType;
  emoji: string;
  label: string;
  bgColor: string;
}[] = [
  { type: "sat", emoji: "🚽", label: "べんざにすわれた！", bgColor: "bg-blue-100" },
  { type: "pee", emoji: "💧", label: "おしっこできた！", bgColor: "bg-yellow-100" },
  { type: "poop", emoji: "💩", label: "うんちできた！", bgColor: "bg-pink-100" },
];

export default function HomeScreen() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { addRecord, getTodayCounts } = useRecords();
  const { addStickers, rewardState } = useRewards();
  const { addPost } = useTimeline();
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationItem, setCelebrationItem] = useState<AvatarItem | null>(null);
  const [lastRecordType, setLastRecordType] = useState<RecordType | null>(null);

  const celebrationScale = useSharedValue(0);
  const celebrationOpacity = useSharedValue(0);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationOpacity.value,
  }));

  useEffect(() => {
    if (!profileLoading && !profile.isOnboardingComplete) {
      router.replace("/onboarding");
    }
  }, [profileLoading, profile.isOnboardingComplete]);

  async function handleRecord(type: RecordType) {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await addRecord(type);
    const result = await addStickers(type, profile.gender);

    if (profile.isTimelineEnabled) {
      addPost({
        nickname: profile.nickname,
        avatarId: profile.avatarId,
        equippedItems: profile.equippedItems,
        recordType: type,
      });
    }

    setLastRecordType(type);

    if (result.pageCompleted && result.newItem) {
      setCelebrationItem(result.newItem);
      setShowCelebration(true);
      celebrationScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );
      celebrationOpacity.value = withTiming(1, { duration: 200 });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      // シール獲得のフィードバック
      setShowCelebration(true);
      setCelebrationItem(null);
      celebrationScale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 150 })
      );
      celebrationOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(800, withTiming(0, { duration: 300 }, () => {
          runOnJS(setShowCelebration)(false);
        }))
      );
    }
  }

  function closeCelebration() {
    celebrationOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setShowCelebration)(false);
    });
    setCelebrationItem(null);
  }

  if (profileLoading || !profile.isOnboardingComplete) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-lg text-muted">よみこみちゅう...</Text>
      </ScreenContainer>
    );
  }

  const todayCounts = getTodayCounts();

  return (
    <ScreenContainer className="flex-1 px-5">
      {/* ヘッダー: アバター + ニックネーム */}
      <View className="items-center pt-4 pb-2">
        <AvatarDisplay
          avatarId={profile.avatarId}
          equippedItems={profile.equippedItems}
          size="large"
        />
        <Text className="text-xl font-bold text-foreground mt-3">
          {profile.nickname}
        </Text>
        <Text className="text-sm text-muted mt-1">
          きょうのがんばり ⭐ {todayCounts.sat + todayCounts.pee + todayCounts.poop} かい
        </Text>
      </View>

      {/* 記録ボタン */}
      <View className="flex-1 justify-center gap-4 py-4">
        {RECORD_BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.type}
            className={`${btn.bgColor} rounded-3xl py-5 px-6 flex-row items-center justify-center gap-3 border border-border`}
            onPress={() => handleRecord(btn.type)}
            activeOpacity={0.7}
          >
            <Text className="text-3xl">{btn.emoji}</Text>
            <Text className="text-xl font-bold text-foreground">
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 今日のサマリー */}
      <View className="flex-row justify-around py-4 bg-surface rounded-2xl mb-4 border border-border">
        <View className="items-center">
          <Text className="text-2xl">🚽</Text>
          <Text className="text-lg font-bold text-foreground">{todayCounts.sat}</Text>
          <Text className="text-xs text-muted">すわれた</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl">💧</Text>
          <Text className="text-lg font-bold text-foreground">{todayCounts.pee}</Text>
          <Text className="text-xs text-muted">おしっこ</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl">💩</Text>
          <Text className="text-lg font-bold text-foreground">{todayCounts.poop}</Text>
          <Text className="text-xs text-muted">うんち</Text>
        </View>
      </View>

      {/* シール獲得フィードバック / ご褒美モーダル */}
      <Modal
        visible={showCelebration}
        transparent
        animationType="none"
        onRequestClose={closeCelebration}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 items-center justify-center"
          activeOpacity={1}
          onPress={celebrationItem ? closeCelebration : undefined}
        >
          <Animated.View
            style={celebrationStyle}
            className="bg-surface rounded-3xl p-8 mx-8 items-center"
          >
            {celebrationItem ? (
              <>
                <Text className="text-5xl mb-4">🎉</Text>
                <Text className="text-2xl font-bold text-foreground text-center mb-2">
                  シール帳かんせい！
                </Text>
                <Text className="text-lg text-muted text-center mb-4">
                  あたらしいアイテムをゲット！
                </Text>
                <View className="bg-primary/10 rounded-2xl p-6 items-center mb-4">
                  <Text className="text-5xl">{celebrationItem.imageKey}</Text>
                  <Text className="text-lg font-bold text-foreground mt-2">
                    {celebrationItem.name}
                  </Text>
                </View>
                <TouchableOpacity
                  className="bg-primary px-8 py-3 rounded-2xl"
                  onPress={closeCelebration}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-bold text-base">やったー！</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-5xl mb-2">⭐</Text>
                <Text className="text-xl font-bold text-foreground text-center">
                  {lastRecordType ? RECORD_TYPE_LABELS[lastRecordType] : ""}！
                </Text>
                <Text className="text-base text-muted mt-1">
                  シールゲット！
                </Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}
