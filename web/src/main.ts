// web/src/main.ts

import { version } from "../../package.json";
import { deserializeAST, serializeAST } from "../../src/spd/ast";
import { ParseError, parse } from "../../src/spd/parser";
import { render as renderSvg } from "../../src/spd/svg-renderer";

document.addEventListener("DOMContentLoaded", () => {
  const appVersion = document.getElementById("appVersion") as HTMLSpanElement;
  if (appVersion) {
    appVersion.textContent = version;
  }

  const spdInput = document.getElementById("spdInput") as HTMLTextAreaElement;
  const importAstCheckbox = document.getElementById(
    "importAstCheckbox",
  ) as HTMLInputElement;
  const svgOutput = document.getElementById("svgOutput") as HTMLDivElement;
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  const downloadButton = document.getElementById(
    "downloadButton",
  ) as HTMLButtonElement;
  const downloadAstButton = document.getElementById(
    "downloadAstButton",
  ) as HTMLButtonElement;
  const downloadSvgButton = document.getElementById(
    "downloadSvgButton",
  ) as HTMLButtonElement;
  const shareButton = document.getElementById(
    "shareButton",
  ) as HTMLButtonElement;

  // Render Options
  const fontSizeInput = document.getElementById(
    "fontSizeInput",
  ) as HTMLInputElement;
  const fontFamilySelect = document.getElementById(
    "fontFamilySelect",
  ) as HTMLSelectElement;
  const fontFamilyCustomInput = document.getElementById(
    "fontFamilyCustomInput",
  ) as HTMLInputElement;
  const customFontCheckbox = document.getElementById(
    "customFontCheckbox",
  ) as HTMLInputElement;
  const baseBackgroundColorInput = document.getElementById(
    "baseBackgroundColorInput",
  ) as HTMLInputElement;
  const transparentBackgroundCheckbox = document.getElementById(
    "transparentBackgroundCheckbox",
  ) as HTMLInputElement;
  const backgroundColorInput = document.getElementById(
    "backgroundColorInput",
  ) as HTMLInputElement;
  const transparentNodeBackgroundCheckbox = document.getElementById(
    "transparentNodeBackgroundCheckbox",
  ) as HTMLInputElement;
  const textColorInput = document.getElementById(
    "textColorInput",
  ) as HTMLInputElement;
  const listRenderTypeTerminalOffset = document.getElementById(
    "listRenderTypeTerminalOffset",
  ) as HTMLInputElement;
  const applyOptionsButton = document.getElementById(
    "applyOptionsButton",
  ) as HTMLButtonElement;

  const convertAndRender = () => {
    const spdText = spdInput.value;
    try {
      const ast = importAstCheckbox.checked
        ? deserializeAST(spdText)
        : parse(spdText);

      if (!ast) {
        throw new Error("Could not obtain AST.");
      }

      const options = {
        fontSize: parseInt(fontSizeInput.value, 10),
        fontFamily: customFontCheckbox.checked
          ? fontFamilyCustomInput.value
          : fontFamilySelect.value,
        baseBackgroundColor: transparentBackgroundCheckbox.checked
          ? null
          : baseBackgroundColorInput.value,
        backgroundColor: transparentNodeBackgroundCheckbox.checked
          ? null
          : backgroundColorInput.value,
        textColor: textColorInput.value,
        listRenderType: listRenderTypeTerminalOffset.checked
          ? "TerminalOffset"
          : "Original",
      };
      const svgString = renderSvg(ast, options);

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      svgOutput.textContent = "";
      if (svgElement && svgElement.tagName === "svg") {
        svgOutput.appendChild(svgElement);
      } else {
        // Fallback for cases where parsing might fail (though renderSvg should return valid SVG)
        svgOutput.innerHTML = svgString;
      }
    } catch (error) {
      const errorDiv = document.createElement("div");
      errorDiv.classList.add("error-message");
      svgOutput.textContent = "";

      if (error instanceof ParseError) {
        const msgPara = document.createElement("div");
        if (error.lineNo !== undefined && error.lineStr !== undefined) {
          msgPara.textContent = `Error at line ${error.lineNo}: ${error.message}`;
          errorDiv.appendChild(msgPara);

          const lineCode = document.createElement("code");
          lineCode.classList.add("error-line");
          lineCode.textContent = error.lineStr;
          errorDiv.appendChild(lineCode);
        } else {
          msgPara.textContent = `Error: ${error.message}`;
          errorDiv.appendChild(msgPara);
        }
        console.error("SPD conversion error:", error);
      } else if (error instanceof Error) {
        const msgPara = document.createElement("div");
        msgPara.textContent = `Error: ${error.message}`;
        errorDiv.appendChild(msgPara);
        console.error("SPD conversion error:", error);
      } else {
        errorDiv.textContent = "An unknown error occurred";
        console.error("An unknown error occurred:", error);
      }

      svgOutput.appendChild(errorDiv);
    }
  };

  customFontCheckbox.addEventListener("change", () => {
    if (customFontCheckbox.checked) {
      fontFamilySelect.style.display = "none";
      fontFamilyCustomInput.style.display = "inline-block";
    } else {
      fontFamilySelect.style.display = "inline-block";
      fontFamilyCustomInput.style.display = "none";
    }
    convertAndRender();
  });

  transparentBackgroundCheckbox.addEventListener("change", () => {
    baseBackgroundColorInput.disabled = transparentBackgroundCheckbox.checked;
  });

  transparentNodeBackgroundCheckbox.addEventListener("change", () => {
    backgroundColorInput.disabled = transparentNodeBackgroundCheckbox.checked;
  });

  spdInput.addEventListener("input", convertAndRender);
  importAstCheckbox.addEventListener("change", convertAndRender);
  applyOptionsButton.addEventListener("click", convertAndRender);

  spdInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault(); // デフォルトのTabキーの動作（フォーカス移動）をキャンセル
      const start = spdInput.selectionStart;
      const end = spdInput.selectionEnd;

      // タブ文字を挿入
      spdInput.value =
        spdInput.value.substring(0, start) +
        "	" +
        spdInput.value.substring(end);

      // カーソル位置をタブの直後に設定
      spdInput.selectionStart = spdInput.selectionEnd = start + 1;

      convertAndRender(); // タブ挿入後も変換を実行
    }
  });

  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        spdInput.value = e.target?.result as string;
        // .jsonファイルの場合は自動的に「ASTとしてインポート」をオンにする
        if (file.name.endsWith(".json")) {
          importAstCheckbox.checked = true;
        } else if (file.name.endsWith(".spd")) {
          importAstCheckbox.checked = false;
        }
        convertAndRender(); // ファイル読み込み後も変換を実行
      };
      reader.readAsText(file);
    }
  });

  const getFileName = (message: string, defaultName: string): string | null => {
    try {
      return prompt(message, defaultName);
    } catch (error) {
      console.warn("prompt() is not supported, using default filename.", error);
      return defaultName;
    }
  };

  downloadButton.addEventListener("click", () => {
    const spdText = spdInput.value;
    const fileNameInput = getFileName(
      "ダウンロードするファイル名を入力してください:",
      "edited_spd.spd",
    );

    if (fileNameInput === null) {
      // ユーザーがキャンセルした場合
      return;
    }

    let fileName = fileNameInput;
    // 拡張子がない場合は.spdを追加
    if (!fileName.endsWith(".spd")) {
      fileName += ".spd";
    }

    const blob = new Blob([spdText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // ユーザーが入力したファイル名を使用
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  downloadAstButton.addEventListener("click", () => {
    const spdText = spdInput.value;
    try {
      const ast = importAstCheckbox.checked
        ? deserializeAST(spdText)
        : parse(spdText);

      if (!ast) {
        alert("ASTを取得できませんでした。内容を確認してください。");
        return;
      }

      const astJson = serializeAST(ast);

      const fileNameInput = getFileName(
        "ダウンロードするASTファイル名を入力してください:",
        "ast.json",
      );

      if (fileNameInput === null) {
        return;
      }

      let fileName = fileNameInput;
      if (!fileName.endsWith(".json")) {
        fileName += ".json";
      }

      const blob = new Blob([astJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        `ASTの生成に失敗しました: ${error instanceof Error ? error.message : error}`,
      );
    }
  });

  downloadSvgButton.addEventListener("click", () => {
    const svgString = svgOutput.innerHTML;
    if (!svgString) {
      alert("SVGが生成されていません。");
      return;
    }

    const fileNameInput = getFileName(
      "ダウンロードするSVGファイル名を入力してください:",
      "output.svg",
    );

    if (fileNameInput === null) {
      // ユーザーがキャンセルした場合
      return;
    }

    let fileName = fileNameInput;
    // 拡張子がない場合は.svgを追加
    if (!fileName.endsWith(".svg")) {
      fileName += ".svg";
    }

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  shareButton.addEventListener("click", () => {
    const spdText = spdInput.value;
    if (!spdText) {
      alert("SPDが入力されていません。");
      return;
    }

    try {
      // UTF-8文字列をBase64にエンコード
      const bytes = new TextEncoder().encode(spdText);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      const base64 = btoa(binString);

      const url = new URL(window.location.href);
      url.searchParams.set("spd", base64);

      navigator.clipboard
        .writeText(url.toString())
        .then(() => {
          alert("共有用URLをクリップボードにコピーしました。");
        })
        .catch((err) => {
          console.error("Failed to copy URL:", err);
          alert("URLのコピーに失敗しました。");
        });
    } catch (error) {
      console.error("Failed to encode SPD:", error);
      alert("URLの生成に失敗しました。");
    }
  });

  // 初期表示用のデータ取得
  const urlParams = new URLSearchParams(window.location.search);
  const spdParam = urlParams.get("spd");

  if (spdParam) {
    try {
      // Base64をデコード（UTF-8対応）
      const binString = atob(spdParam);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0);
      spdInput.value = new TextDecoder().decode(bytes);
    } catch (error) {
      console.error("Failed to decode SPD from URL parameter:", error);
      // デコードに失敗した場合はデフォルトを表示
      spdInput.value = getDefaultSpd();
    }
  } else {
    spdInput.value = getDefaultSpd();
  }

  convertAndRender(); // ページロード時に一度変換を実行
});

function getDefaultSpd(): string {
  return `:terminal 開始
命令
:comment コメント文
:call 関数呼び出し
	中身
:if 条件式
	真の場合
:else
	偽の場合(:else以下は省略可能)
:switch 条件
:case ケース1
	ケース1の中身
:case ケース2
	ケース2の中身
:case ...
	ケース文は必要に応じていくつでも追加できます
:while 繰り返し条件（先判定）
	中身
:dowhile 繰り返し条件（後判定）
	中身
:terminal 終了`;
}
