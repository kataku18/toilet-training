import React, { createContext, useContext, useState, useCallback } from "react";
import type { TimelinePost, RecordType, ReactionType, EquippedItems } from "@/types";
import { RECORD_TYPE_LABELS } from "@/types";

interface TimelineContextValue {
  posts: TimelinePost[];
  addPost: (params: {
    nickname: string;
    avatarId: string;
    equippedItems: EquippedItems;
    recordType: RecordType;
  }) => void;
  addReaction: (postId: string, reactionType: ReactionType) => void;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * デモ用のダミーデータを生成
 * 実際のアプリではサーバーからデータを取得する
 */
function generateDemoPosts(): TimelinePost[] {
  const demoUsers = [
    { nickname: "ゆうくん", avatarId: "avatar_bear", equippedItems: { hat: "hat_cap", outfit: null, accessory: null } },
    { nickname: "はなちゃん", avatarId: "avatar_rabbit", equippedItems: { hat: "hat_ribbon", outfit: null, accessory: "acc_heart" } },
    { nickname: "そうたくん", avatarId: "avatar_dog", equippedItems: { hat: null, outfit: "outfit_hero", accessory: null } },
    { nickname: "みおちゃん", avatarId: "avatar_cat", equippedItems: { hat: "hat_flower", outfit: "outfit_princess", accessory: null } },
    { nickname: "けんちゃん", avatarId: "avatar_panda", equippedItems: { hat: "hat_star", outfit: null, accessory: "acc_medal" } },
  ];

  const recordTypes: RecordType[] = ["sat", "pee", "poop", "poop", "pee"];
  const now = Date.now();

  return demoUsers.map((user, i) => ({
    id: `demo_${i}`,
    nickname: user.nickname,
    avatarId: user.avatarId,
    equippedItems: user.equippedItems as EquippedItems,
    recordType: recordTypes[i],
    message: `${RECORD_TYPE_LABELS[recordTypes[i]]}！`,
    timestamp: new Date(now - i * 3600000 - Math.random() * 1800000).toISOString(),
    reactions: [
      { type: "amazing" as ReactionType, count: Math.floor(Math.random() * 5) },
      { type: "great_job" as ReactionType, count: Math.floor(Math.random() * 3) },
      { type: "hooray" as ReactionType, count: Math.floor(Math.random() * 4) },
    ],
  }));
}

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<TimelinePost[]>(generateDemoPosts());

  const addPost = useCallback(
    (params: {
      nickname: string;
      avatarId: string;
      equippedItems: EquippedItems;
      recordType: RecordType;
    }) => {
      const newPost: TimelinePost = {
        id: generateId(),
        nickname: params.nickname,
        avatarId: params.avatarId,
        equippedItems: params.equippedItems,
        recordType: params.recordType,
        message: `${RECORD_TYPE_LABELS[params.recordType]}！`,
        timestamp: new Date().toISOString(),
        reactions: [
          { type: "amazing", count: 0 },
          { type: "great_job", count: 0 },
          { type: "hooray", count: 0 },
        ],
      };
      setPosts((prev) => [newPost, ...prev]);
    },
    []
  );

  const addReaction = useCallback((postId: string, reactionType: ReactionType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          reactions: post.reactions.map((r) =>
            r.type === reactionType ? { ...r, count: r.count + 1 } : r
          ),
        };
      })
    );
  }, []);

  return (
    <TimelineContext.Provider value={{ posts, addPost, addReaction }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return ctx;
}
