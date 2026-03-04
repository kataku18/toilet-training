import { View, Text, FlatList, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { useTimeline } from "@/hooks/use-timeline";
import type { TimelinePost, ReactionType } from "@/types";
import { REACTION_LABELS, RECORD_TYPE_LABELS } from "@/types";
import { BASE_AVATARS } from "@/constants/avatars";

const RECORD_EMOJIS = {
  sat: "🚽",
  pee: "💧",
  poop: "💩",
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たったいま";
  if (minutes < 60) return `${minutes}ふんまえ`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}じかんまえ`;
  const days = Math.floor(hours / 24);
  return `${days}にちまえ`;
}

function TimelineCard({
  post,
  onReaction,
}: {
  post: TimelinePost;
  onReaction: (postId: string, type: ReactionType) => void;
}) {
  function handleReaction(type: ReactionType) {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onReaction(post.id, type);
  }

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      {/* ユーザー情報 */}
      <View className="flex-row items-center gap-3 mb-3">
        <AvatarDisplay
          avatarId={post.avatarId}
          equippedItems={post.equippedItems}
          size="small"
        />
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">
            {post.nickname}
          </Text>
          <Text className="text-xs text-muted">
            {formatTimeAgo(post.timestamp)}
          </Text>
        </View>
        <Text className="text-2xl">{RECORD_EMOJIS[post.recordType]}</Text>
      </View>

      {/* メッセージ */}
      <View className="bg-primary/10 rounded-xl px-4 py-3 mb-3">
        <Text className="text-base font-bold text-foreground text-center">
          {RECORD_EMOJIS[post.recordType]} {post.message}
        </Text>
      </View>

      {/* 応援スタンプ */}
      <View className="flex-row gap-2">
        {(Object.keys(REACTION_LABELS) as ReactionType[]).map((type) => {
          const reaction = post.reactions.find((r) => r.type === type);
          const count = reaction?.count ?? 0;
          return (
            <TouchableOpacity
              key={type}
              className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-xl bg-background border border-border"
              onPress={() => handleReaction(type)}
              activeOpacity={0.7}
            >
              <Text className="text-sm">
                {REACTION_LABELS[type].emoji}
              </Text>
              {count > 0 && (
                <Text className="text-xs font-bold text-primary">{count}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TimelineScreen() {
  const { posts, addReaction } = useTimeline();

  return (
    <ScreenContainer className="flex-1">
      {/* ヘッダー */}
      <View className="px-5 pt-4 pb-2 items-center">
        <Text className="text-2xl font-bold text-foreground">
          みんなのがんばり
        </Text>
        <Text className="text-sm text-muted mt-1">
          おうえんしよう！
        </Text>
      </View>

      {/* タイムライン */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <TimelineCard post={item} onReaction={addReaction} />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-4xl mb-4">🌟</Text>
            <Text className="text-base text-muted text-center">
              まだとうこうがないよ{"\n"}
              トイレきろくをつけてみよう！
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
