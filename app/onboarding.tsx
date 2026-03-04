import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { useProfile } from "@/hooks/use-profile";
import { BASE_AVATARS } from "@/constants/avatars";
import type { Gender } from "@/types";

type Step = "nickname" | "gender" | "age" | "avatar";

const STEPS: Step[] = ["nickname", "gender", "age", "avatar"];

const AGE_OPTIONS = [
  { label: "1さい", months: 12 },
  { label: "1さいはん", months: 18 },
  { label: "2さい", months: 24 },
  { label: "2さいはん", months: 30 },
  { label: "3さい", months: 36 },
  { label: "3さいはん", months: 42 },
  { label: "4さい", months: 48 },
  { label: "4さいいじょう", months: 54 },
];

export default function OnboardingScreen() {
  const { updateProfile, completeOnboarding } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<Gender>("unset");
  const [ageMonths, setAgeMonths] = useState(24);
  const [avatarId, setAvatarId] = useState("avatar_bear");

  const step = STEPS[currentStep];

  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function handleComplete() {
    const sanitizedNickname = nickname
      .trim()
      .replace(/<[^>]*>/g, "")
      .replace(/[&<>"']/g, "")
      .substring(0, 10);

    await updateProfile({
      nickname: sanitizedNickname || "ぼうけんか",
      gender,
      ageMonths,
      avatarId,
    });
    await completeOnboarding();
    router.replace("/(tabs)");
  }

  function canProceed(): boolean {
    switch (step) {
      case "nickname":
        return nickname.trim().length > 0 && nickname.trim().length <= 10;
      case "gender":
        return gender !== "unset";
      case "age":
        return true;
      case "avatar":
        return true;
      default:
        return false;
    }
  }

  return (
    <ScreenContainer
      edges={["top", "bottom", "left", "right"]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8 pb-6">
            {/* プログレスバー */}
            <View className="flex-row gap-2 mb-8">
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </View>

            {/* ステップコンテンツ */}
            <View className="flex-1 justify-center">
              {step === "nickname" && (
                <View className="items-center gap-6">
                  <Text className="text-4xl">🚽</Text>
                  <Text className="text-2xl font-bold text-foreground text-center">
                    なまえをおしえてね！
                  </Text>
                  <Text className="text-base text-muted text-center">
                    ニックネームをいれてね（10もじまで）
                  </Text>
                  <TextInput
                    className="w-full bg-surface border border-border rounded-2xl px-5 py-4 text-lg text-foreground text-center"
                    placeholder="ニックネーム"
                    placeholderTextColor="#B8A48C"
                    value={nickname}
                    onChangeText={(text) => setNickname(text.substring(0, 10))}
                    maxLength={10}
                    returnKeyType="done"
                    autoFocus
                  />
                  <Text className="text-sm text-muted">
                    {nickname.length}/10
                  </Text>
                </View>
              )}

              {step === "gender" && (
                <View className="items-center gap-6">
                  <Text className="text-4xl">👦👧</Text>
                  <Text className="text-2xl font-bold text-foreground text-center">
                    おとこのこ？おんなのこ？
                  </Text>
                  <Text className="text-base text-muted text-center">
                    もらえるアイテムがかわるよ
                  </Text>
                  <View className="flex-row gap-4 w-full">
                    <TouchableOpacity
                      className={`flex-1 py-6 rounded-2xl items-center border-2 ${
                        gender === "boy"
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                      onPress={() => setGender("boy")}
                      activeOpacity={0.7}
                    >
                      <Text className="text-3xl mb-2">👦</Text>
                      <Text
                        className={`text-lg font-bold ${
                          gender === "boy" ? "text-white" : "text-foreground"
                        }`}
                      >
                        おとこのこ
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-6 rounded-2xl items-center border-2 ${
                        gender === "girl"
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                      onPress={() => setGender("girl")}
                      activeOpacity={0.7}
                    >
                      <Text className="text-3xl mb-2">👧</Text>
                      <Text
                        className={`text-lg font-bold ${
                          gender === "girl" ? "text-white" : "text-foreground"
                        }`}
                      >
                        おんなのこ
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {step === "age" && (
                <View className="items-center gap-6">
                  <Text className="text-4xl">🎂</Text>
                  <Text className="text-2xl font-bold text-foreground text-center">
                    なんさいかな？
                  </Text>
                  <View className="flex-row flex-wrap justify-center gap-3 w-full">
                    {AGE_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.months}
                        className={`px-5 py-3 rounded-2xl border-2 ${
                          ageMonths === opt.months
                            ? "bg-primary border-primary"
                            : "bg-surface border-border"
                        }`}
                        onPress={() => setAgeMonths(opt.months)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-base font-bold ${
                            ageMonths === opt.months
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {step === "avatar" && (
                <View className="items-center gap-6">
                  <AvatarDisplay
                    avatarId={avatarId}
                    equippedItems={{ hat: null, outfit: null, accessory: null }}
                    size="large"
                  />
                  <Text className="text-2xl font-bold text-foreground text-center">
                    アバターをえらんでね！
                  </Text>
                  <View className="flex-row flex-wrap justify-center gap-4">
                    {BASE_AVATARS.map((avatar) => (
                      <TouchableOpacity
                        key={avatar.id}
                        className={`items-center p-3 rounded-2xl border-2 ${
                          avatarId === avatar.id
                            ? "bg-primary border-primary"
                            : "bg-surface border-border"
                        }`}
                        onPress={() => setAvatarId(avatar.id)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-3xl">{avatar.emoji}</Text>
                        <Text
                          className={`text-xs mt-1 font-bold ${
                            avatarId === avatar.id
                              ? "text-white"
                              : "text-foreground"
                          }`}
                        >
                          {avatar.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* ナビゲーションボタン */}
            <View className="flex-row gap-3 mt-8">
              {currentStep > 0 && (
                <TouchableOpacity
                  className="flex-1 py-4 rounded-2xl bg-surface border border-border items-center"
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-bold text-foreground">
                    もどる
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center ${
                  canProceed()
                    ? "bg-primary"
                    : "bg-border"
                }`}
                onPress={
                  currentStep === STEPS.length - 1 ? handleComplete : handleNext
                }
                disabled={!canProceed()}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-base font-bold ${
                    canProceed() ? "text-white" : "text-muted"
                  }`}
                >
                  {currentStep === STEPS.length - 1 ? "はじめる！" : "つぎへ"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
