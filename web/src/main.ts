// web/src/main.ts

// @ts-expect-error
import defaultSpdContent from "bundle-text:../../sample_input.spd";
import * as monaco from "monaco-editor";
import { version } from "../../package.json";
import { deserializeAST, serializeAST } from "../../src/spd/ast";
import { ParseError, parse } from "../../src/spd/parser";
import { render as renderSvg } from "../../src/spd/svg-renderer";
import { SPD_LANGUAGE_ID, registerSpdLanguage } from "./spd-language";
import { SpdLspClient } from "./spd-lsp-client";

// MonacoEnvironment の設定（Parcel の module worker を利用）
// @ts-ignore
window.MonacoEnvironment = {
  getWorker: function (_workerId: string, _label: string) {
    return new Worker(
      new URL("./editor-worker.ts", import.meta.url),
      { type: "module" },
    );
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const appVersion = document.getElementById("appVersion") as HTMLSpanElement;
  if (appVersion) {
    appVersion.textContent = version;
  }

  const spdInput = document.getElementById("spdInput") as HTMLTextAreaElement;
  const spdEditorContainer = document.getElementById(
    "spdEditorContainer",
  ) as HTMLDivElement;
  const inputModeSpd = document.getElementById(
    "inputModeSpd",
  ) as HTMLInputElement;
  const inputModeAst = document.getElementById(
    "inputModeAst",
  ) as HTMLInputElement;

  const svgOutput = document.getElementById("svgOutput") as HTMLDivElement;
  const svgViewer = document.getElementById("svgViewer") as HTMLDivElement;
  const astOutput = document.getElementById("astOutput") as HTMLTextAreaElement;
  const errorOutput = document.getElementById("errorOutput") as HTMLDivElement;
  const displayModeSvg = document.getElementById(
    "displayModeSvg",
  ) as HTMLInputElement;
  const displayModeAst = document.getElementById(
    "displayModeAst",
  ) as HTMLInputElement;
  const displayModeAstPretty = document.getElementById(
    "displayModeAstPretty",
  ) as HTMLInputElement;
  const displayModeError = document.getElementById(
    "displayModeError",
  ) as HTMLInputElement;
  const _displayModeErrorLabel = document.getElementById(
    "displayModeErrorLabel",
  ) as HTMLLabelElement;

  const zoomInButton = document.getElementById(
    "zoomInButton",
  ) as HTMLButtonElement;
  const zoomOutButton = document.getElementById(
    "zoomOutButton",
  ) as HTMLButtonElement;
  const resetZoomButton = document.getElementById(
    "resetZoomButton",
  ) as HTMLButtonElement;
  const zoomLevelInput = document.getElementById(
    "zoomLevelInput",
  ) as HTMLInputElement;
  const fullscreenButton = document.getElementById(
    "fullscreenButton",
  ) as HTMLButtonElement;
  const checkerboardButton = document.getElementById(
    "checkerboardButton",
  ) as HTMLButtonElement;
  const checkerboardIcon = document.getElementById(
    "checkerboardIcon",
  ) as HTMLSpanElement;

  let zoomLevel = 1.0;
  let showCheckerboard = true;
  let lastSuccessfulDisplayMode: "svg" | "ast" | "astPretty" = "svg";

  // 初期表示用のデータ取得
  const urlParams = new URLSearchParams(window.location.search);
  const spdParam = urlParams.get("spd");
  const astParam = urlParams.get("ast");

  let initialSpdText = getDefaultSpd();
  if (spdParam) {
    try {
      const binString = atob(spdParam);
      const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0);
      initialSpdText = new TextDecoder().decode(bytes);
      if (astParam === "1") {
        inputModeAst.checked = true;
      }
    } catch (error) {
      console.error("Failed to decode SPD from URL parameter:", error);
      initialSpdText = getDefaultSpd();
    }
  }

  // Monaco Editor と言語・LSP の初期化
  registerSpdLanguage(monaco);

  const initialLanguage = inputModeAst.checked ? "json" : SPD_LANGUAGE_ID;
  const spdModel = monaco.editor.createModel(
    initialSpdText,
    initialLanguage,
    monaco.Uri.parse("inmemory://model/input.spd"),
  );

  const editor = monaco.editor.create(spdEditorContainer, {
    model: spdModel,
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    fontSize: 14,
    fontFamily: "monospace",
    theme: "vs",
  });

  // hidden textarea と同期
  if (spdInput) {
    spdInput.value = initialSpdText;
  }

  // LSP クライアントを起動してモデルをバインド
  const lspClient = new SpdLspClient();
  lspClient.registerProviders(SPD_LANGUAGE_ID);
  lspClient
    .start()
    .then(() => {
      lspClient.bindModel(spdModel, SPD_LANGUAGE_ID);
    })
    .catch((err) => {
      console.error("Failed to start LSP client:", err);
    });

  const updateViewerBackground = () => {
    if (showCheckerboard) {
      svgOutput.classList.add("show-checkerboard");
      svgOutput.style.backgroundColor = "";
      checkerboardButton.classList.add("active");
      checkerboardIcon.textContent = "grid_on";
    } else {
      svgOutput.classList.remove("show-checkerboard");
      svgOutput.style.backgroundColor = baseBackgroundColorInput.value;
      checkerboardButton.classList.remove("active");
      checkerboardIcon.textContent = "grid_off";
    }
  };

  checkerboardButton.addEventListener("click", () => {
    showCheckerboard = !showCheckerboard;
    updateViewerBackground();
  });

  const updateZoom = (newLevel?: number) => {
    if (newLevel !== undefined) {
      zoomLevel = Math.max(0.1, Math.min(newLevel, 5.0));
    }

    const svgElement = svgOutput.querySelector("svg");
    if (svgElement) {
      svgElement.style.transform = `scale(${zoomLevel})`;
    }
    if (zoomLevelInput) {
      zoomLevelInput.value = Math.round(zoomLevel * 100).toString();
    }
  };

  zoomInButton.addEventListener("click", () => {
    updateZoom(zoomLevel + 0.1);
  });

  zoomOutButton.addEventListener("click", () => {
    updateZoom(zoomLevel - 0.1);
  });

  resetZoomButton.addEventListener("click", () => {
    updateZoom(1.0);
  });

  zoomLevelInput.addEventListener("change", () => {
    const value = parseInt(zoomLevelInput.value, 10);
    if (!Number.isNaN(value)) {
      updateZoom(value / 100);
    } else {
      updateZoom();
    }
  });

  zoomLevelInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      zoomLevelInput.blur();
    }
  });

  fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      svgViewer.requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  });

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
    const spdText = editor.getValue();
    if (spdInput && spdInput.value !== spdText) {
      spdInput.value = spdText;
    }

    const isAstPrettyMode = displayModeAstPretty.checked;

    if (!displayModeError.checked) {
      if (displayModeSvg.checked) lastSuccessfulDisplayMode = "svg";
      else if (displayModeAst.checked) lastSuccessfulDisplayMode = "ast";
      else if (displayModeAstPretty.checked)
        lastSuccessfulDisplayMode = "astPretty";
    }

    try {
      const ast = inputModeAst.checked
        ? deserializeAST(spdText)
        : parse(spdText);

      if (!ast) {
        throw new Error("Could not obtain AST.");
      }

      displayModeSvg.disabled = false;
      displayModeAst.disabled = false;
      displayModeAstPretty.disabled = false;
      displayModeError.disabled = true;
      errorOutput.style.display = "none";

      if (displayModeError.checked) {
        if (lastSuccessfulDisplayMode === "svg") displayModeSvg.checked = true;
        else if (lastSuccessfulDisplayMode === "ast")
          displayModeAst.checked = true;
        else if (lastSuccessfulDisplayMode === "astPretty")
          displayModeAstPretty.checked = true;
      }

      if (displayModeSvg.checked) {
        svgViewer.style.display = "flex";
        astOutput.style.display = "none";
        downloadSvgButton.style.display = "inline-flex";
        downloadAstButton.style.display = "none";

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
          listRenderType: (listRenderTypeTerminalOffset.checked
            ? "TerminalOffset"
            : "Original") as "TerminalOffset" | "Original",
        };

        const svg = renderSvg(ast, options);
        svgOutput.innerHTML = svg;
        updateZoom();
      } else if (displayModeAst.checked || isAstPrettyMode) {
        svgViewer.style.display = "none";
        astOutput.style.display = "block";
        downloadSvgButton.style.display = "none";
        downloadAstButton.style.display = "inline-flex";

        const indent = isAstPrettyMode ? 2 : undefined;
        astOutput.value = serializeAST(ast, indent);
      }
    } catch (error) {
      console.error("Conversion error:", error);

      svgViewer.style.display = "none";
      astOutput.style.display = "none";
      downloadSvgButton.style.display = "none";
      downloadAstButton.style.display = "none";
      displayModeError.disabled = false;
      displayModeError.checked = true;
      errorOutput.style.display = "block";

      displayModeSvg.disabled = true;
      displayModeAst.disabled = true;
      displayModeAstPretty.disabled = true;

      let errorMessage = "An unknown error occurred.";
      let lineNo: number | undefined;

      if (error instanceof ParseError) {
        errorMessage = error.message;
        lineNo = error.lineNo;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      errorOutput.innerHTML = `
        <div class="error-message">
          <h3>Conversion Error</h3>
          <p>${escapeHtml(errorMessage)}</p>
          ${lineNo !== undefined ? `<p>Line: ${lineNo}</p>` : ""}
        </div>
      `;
    }
  };

  // エディタのコンテンツ変更監視
  editor.onDidChangeModelContent(() => {
    convertAndRender();
  });

  // hidden な spdInput に外部から input イベントが発行された場合の同期（テスト等）
  if (spdInput) {
    spdInput.addEventListener("input", () => {
      if (spdInput.value !== editor.getValue()) {
        editor.setValue(spdInput.value);
      }
    });
  }

  customFontCheckbox.addEventListener("change", () => {
    if (customFontCheckbox.checked) {
      fontFamilySelect.style.display = "none";
      fontFamilyCustomInput.style.display = "inline-block";
    } else {
      fontFamilySelect.style.display = "inline-block";
      fontFamilyCustomInput.style.display = "none";
    }
  });

  transparentBackgroundCheckbox.addEventListener("change", () => {
    baseBackgroundColorInput.disabled = transparentBackgroundCheckbox.checked;
  });

  transparentNodeBackgroundCheckbox.addEventListener("change", () => {
    backgroundColorInput.disabled = transparentNodeBackgroundCheckbox.checked;
  });

  inputModeSpd.addEventListener("change", () => {
    if (inputModeSpd.checked) {
      monaco.editor.setModelLanguage(spdModel, SPD_LANGUAGE_ID);
    }
    convertAndRender();
  });

  inputModeAst.addEventListener("change", () => {
    if (inputModeAst.checked) {
      monaco.editor.setModelLanguage(spdModel, "json");
    }
    convertAndRender();
  });

  displayModeSvg.addEventListener("change", convertAndRender);
  displayModeAst.addEventListener("change", convertAndRender);
  displayModeAstPretty.addEventListener("change", convertAndRender);
  applyOptionsButton.addEventListener("click", convertAndRender);

  fileInput.addEventListener("change", (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || "";
        if (file.name.endsWith(".json")) {
          inputModeAst.checked = true;
          monaco.editor.setModelLanguage(spdModel, "json");
        } else if (file.name.endsWith(".spd")) {
          inputModeSpd.checked = true;
          monaco.editor.setModelLanguage(spdModel, SPD_LANGUAGE_ID);
        }
        editor.setValue(text);
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
    const spdText = editor.getValue();
    const isAst = inputModeAst.checked;
    const defaultFileName = isAst ? "input_ast.json" : "edited_spd.spd";
    const fileNameInput = getFileName(
      "ダウンロードするファイル名を入力してください:",
      defaultFileName,
    );

    if (fileNameInput === null) {
      return;
    }

    let fileName = fileNameInput;
    if (isAst) {
      if (!fileName.endsWith(".json")) {
        fileName += ".json";
      }
    } else {
      if (!fileName.endsWith(".spd")) {
        fileName += ".spd";
      }
    }

    const mimeType = isAst ? "application/json" : "text/plain";
    const blob = new Blob([spdText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  downloadAstButton.addEventListener("click", () => {
    const spdText = editor.getValue();
    try {
      const ast = inputModeAst.checked
        ? deserializeAST(spdText)
        : parse(spdText);

      if (!ast) {
        alert("ASTを取得できませんでした。内容を確認してください。");
        return;
      }

      const isAstPrettyMode = displayModeAstPretty.checked;
      const astJson = isAstPrettyMode
        ? serializeAST(ast, 2)
        : serializeAST(ast);

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
      return;
    }

    let fileName = fileNameInput;
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
    const spdText = editor.getValue();
    if (!spdText) {
      alert("SPDが入力されていません。");
      return;
    }

    try {
      const bytes = new TextEncoder().encode(spdText);
      const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
      ).join("");
      const base64 = btoa(binString);

      const url = new URL(window.location.href);
      url.searchParams.set("spd", base64);
      if (inputModeAst.checked) {
        url.searchParams.set("ast", "1");
      }

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

  baseBackgroundColorInput.addEventListener("input", () => {
    updateViewerBackground();
  });

  convertAndRender();
  updateViewerBackground();
});

function getDefaultSpd(): string {
  return defaultSpdContent.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
