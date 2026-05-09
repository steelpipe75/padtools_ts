"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPD_EXPLANATION = void 0;
/**
 * SPD (Simple PAD Description) 記法の説明
 */
exports.SPD_EXPLANATION = `
# SPD (Simple PAD Description) 記法リファレンス

SPDは、テキストでPAD図を記述するための簡潔な記法です。

## 基本構造

- **ブロック**: 1行がPADの1ボックスに対応します。
- **コメント**: \`#\` で始まる行はコメントとして無視されます。
- **インデント**: タブ文字でインデントを下げることで、親子関係（制御構造の中身など）を表現します。

## 改行 (@)

文中に \`@\` を使用すると、ボックス内での改行として扱われます。
文末に \`@\` を置くと、次の行の内容も同じボックスに含まれます。

## 特殊な命令 (:)

行頭を \`:\` で始めることで、特別な意味を持つボックスを作成できます。

| 命令 | 説明 | 例 |
| :--- | :--- | :--- |
| \`:terminal\` | 端子（開始・終了など） | \`:terminal 開始\` |
| \`:comment\` | 図の中にコメントを表示 | \`:comment 補足説明\` |
| \`:call\` | 関数呼び出し | \`:call サブルーチン名\` |
| \`:if\` | 条件分岐（真） | \`:if 条件式\` |
| \`:else\` | \`:if\` の偽ルート | \`:else\` |
| \`:while\` | 前判定繰り返し | \`:while 継続条件\` |
| \`:dowhile\` | 後判定繰り返し | \`:dowhile 継続条件\` |
| \`:switch\` | 多分岐 | \`:switch 変数\` |
| \`:case\` | \`:switch\` の分岐先 | \`:case 値\` |

## 記述例

\`\`\`spd
:terminal 開始
a = 10
:if a > 5
	a を表示
:else
	何もしない
:while i < 10
	i = i + 1
:terminal 終了
\`\`\`
`;
