# コーディング規約 - トイレの冒険

## 1. 命名規則

### 1.1. 変数・関数

| 対象 | 規則 | 例 |
| :--- | :--- | :--- |
| ローカル変数 | camelCase | `stickerCount`, `userName` |
| 定数 | UPPER_SNAKE_CASE | `MAX_STICKER_COUNT`, `DEFAULT_AVATAR_ID` |
| 関数 | camelCase（動詞始まり） | `handlePress()`, `fetchTimeline()`, `saveProfile()` |
| ブール変数 | is/has/can/should 接頭辞 | `isLoading`, `hasReward`, `canSubmit` |
| イベントハンドラ | handle + 対象 + 動詞 | `handleStickerTap`, `handleProfileSave` |
| コールバックProps | on + 対象 + 動詞 | `onStickerTap`, `onProfileSave` |

### 1.2. コンポーネント・型

| 対象 | 規則 | 例 |
| :--- | :--- | :--- |
| Reactコンポーネント | PascalCase | `StickerBook`, `AvatarPreview` |
| 型・インターフェース | PascalCase | `UserProfile`, `ToiletRecord` |
| Enum | PascalCase（値はUPPER_SNAKE_CASE） | `RecordType.PEE`, `Gender.BOY` |
| Context | PascalCase + Context | `ProfileContext`, `RewardContext` |
| Hook | use + PascalCase | `useProfile`, `useRewards` |
| Provider | PascalCase + Provider | `ProfileProvider`, `RewardProvider` |

### 1.3. ファイル・ディレクトリ

| 対象 | 規則 | 例 |
| :--- | :--- | :--- |
| コンポーネントファイル | kebab-case.tsx | `sticker-book.tsx`, `avatar-preview.tsx` |
| Hook ファイル | use-kebab-case.ts | `use-profile.ts`, `use-rewards.ts` |
| 型定義ファイル | kebab-case.ts | `types/profile.ts`, `types/reward.ts` |
| 定数ファイル | kebab-case.ts | `constants/avatars.ts`, `constants/stickers.ts` |
| ユーティリティ | kebab-case.ts | `lib/storage.ts`, `lib/utils.ts` |

## 2. ディレクトリ構成

```
app/
  (tabs)/           ← タブ画面
  onboarding/       ← オンボーディング画面
  _layout.tsx       ← ルートレイアウト
components/
  ui/               ← 汎用UIコンポーネント
  avatar/           ← アバター関連コンポーネント
  sticker/          ← シール関連コンポーネント
  timeline/         ← タイムライン関連コンポーネント
constants/
  avatars.ts        ← アバター定義データ
  stickers.ts       ← シール定義データ
  rewards.ts        ← ご褒美定義データ
hooks/
  use-profile.ts    ← プロフィール管理Hook
  use-rewards.ts    ← ご褒美管理Hook
  use-records.ts    ← トイレ記録管理Hook
lib/
  storage.ts        ← AsyncStorageラッパー
  utils.ts          ← ユーティリティ関数
types/
  index.ts          ← 共通型定義
```

## 3. TypeScript規約

### 3.1. 型定義

型定義は `types/` ディレクトリに集約し、明示的な型注釈を使用する。`any` 型の使用は原則禁止とする。

```typescript
// ✅ Good
interface UserProfile {
  nickname: string;
  gender: Gender;
  ageMonths: number;
  avatarId: string;
}

// ❌ Bad
const profile: any = { ... };
```

### 3.2. Enum vs Union Type

状態やカテゴリの表現には、文字列リテラルのUnion Typeを優先する。

```typescript
// ✅ Preferred
type RecordType = "sat" | "pee" | "poop";
type Gender = "boy" | "girl" | "unset";

// △ Acceptable (外部APIとの連携時)
enum RecordType {
  SAT = "sat",
  PEE = "pee",
  POOP = "poop",
}
```

## 4. コンポーネント規約

### 4.1. 関数コンポーネント

全てのコンポーネントは関数コンポーネントとして記述する。

```typescript
// ✅ Good
export function StickerBook({ stickers }: StickerBookProps) {
  return <View>...</View>;
}

// ❌ Bad
export const StickerBook: React.FC<StickerBookProps> = ({ stickers }) => {
  return <View>...</View>;
};
```

### 4.2. Props定義

Propsは同ファイル内でinterfaceとして定義する。

```typescript
interface StickerBookProps {
  stickers: Sticker[];
  onStickerTap?: (stickerId: string) => void;
}
```

## 5. 状態管理規約

ローカル状態は `useState` / `useReducer` を使用し、永続化が必要な場合は `AsyncStorage` を使用する。グローバル状態は React Context + Provider パターンで管理する。

## 6. セキュリティ規約

### 6.1. データ保護

個人を特定できる情報（氏名、住所、電話番号等）は一切収集・保存しない。保存するデータはニックネーム、性別、月齢のみとし、これらはデバイスローカルの `AsyncStorage` に保存する。

### 6.2. ソーシャル機能

タイムラインに投稿される情報はニックネームとトイレ記録の種類のみとする。投稿のON/OFF設定を必ず提供し、デフォルトはOFFとする。不適切なニックネームのフィルタリングを実装する。

### 6.3. 入力値検証

全てのユーザー入力に対してバリデーションを実施する。ニックネームは10文字以内、特殊文字・HTMLタグの除去（サニタイズ）を行う。

### 6.4. 通信

サーバーとの通信は全てHTTPSを使用する。APIリクエストにはレート制限を設ける。

## 7. Git運用規約

### 7.1. ブランチ戦略

`main` ブランチから `feature/` ブランチを切って作業し、完了後に `main` へマージする。

```
main
  └── feature/f001-user-profile
  └── feature/f002-toilet-record
  └── feature/f003-reward-system
  └── feature/f004-social-timeline
```

### 7.2. コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更
```
