// web/src/spd-language.ts

import type * as monaco from "monaco-editor";

export const SPD_LANGUAGE_ID = "spd";

export function registerSpdLanguage(monacoInstance: typeof monaco) {
  // すでに登録されている場合はスキップ
  const languages = monacoInstance.languages.getLanguages();
  if (languages.some((lang) => lang.id === SPD_LANGUAGE_ID)) {
    return;
  }

  monacoInstance.languages.register({
    id: SPD_LANGUAGE_ID,
    extensions: [".spd"],
    aliases: ["SPD", "spd"],
    mimetypes: ["text/x-spd"],
  });

  // 言語の言語設定（コメントやブラケットなど）
  monacoInstance.languages.setLanguageConfiguration(SPD_LANGUAGE_ID, {
    comments: {
      lineComment: "#",
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  // Monarch によるシンタックスハイライト
  monacoInstance.languages.setMonarchTokensProvider(SPD_LANGUAGE_ID, {
    keywords: [
      ":if",
      ":while",
      ":dowhile",
      ":call",
      ":switch",
      ":case",
      ":else",
      ":terminal",
      ":comment",
    ],
    tokenizer: {
      root: [
        // コマンドキーワード
        [
          /:(?:if|while|dowhile|call|switch|case|else|terminal|comment)\b/,
          "keyword",
        ],
        // コマンドのコロンで始まる未知のキーワード
        [/:[a-zA-Z_]\w*/, "keyword.invalid"],
        // コメント (# から行末まで)
        [/#.*$/, "comment"],
        // 継続行マーカー (@)
        [/@\s*$/, "keyword.directive"],
        // 文字列リテラル
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        // 空白・インデント
        [/\t+/, "delimiter"],
        [/\s+/, "white"],
      ],
    },
  });
}
