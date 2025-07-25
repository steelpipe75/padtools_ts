// web/src/main.ts
import { SPDParser } from "../../src/spd/parser";
import { render as renderSvg } from "../../src/spd/svg-renderer";

document.addEventListener("DOMContentLoaded", () => {
  const spdInput = document.getElementById("spdInput") as HTMLTextAreaElement;
  const svgOutput = document.getElementById("svgOutput") as HTMLDivElement;
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  const downloadButton = document.getElementById("downloadButton") as HTMLButtonElement;
  const downloadSvgButton = document.getElementById("downloadSvgButton") as HTMLButtonElement;

  const convertAndRender = () => {
    const spdText = spdInput.value;
    try {
      const ast = SPDParser.parse(spdText);
      const svgString = renderSvg(ast);
      svgOutput.innerHTML = svgString;
    } catch (error: any) {
      svgOutput.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
      console.error("SPD conversion error:", error);
    }
  };

  spdInput.addEventListener("input", convertAndRender);

  spdInput.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault(); // デフォルトのTabキーの動作（フォーカス移動）をキャンセル
      const start = spdInput.selectionStart;
      const end = spdInput.selectionEnd;

      // タブ文字を挿入
      spdInput.value = spdInput.value.substring(0, start) + "	" + spdInput.value.substring(end);

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
        convertAndRender(); // ファイル読み込み後も変換を実行
      };
      reader.readAsText(file);
    }
  });

  downloadButton.addEventListener("click", () => {
    const spdText = spdInput.value;
    let fileName = prompt("ダウンロードするファイル名を入力してください:", "edited_spd.spd");

    if (fileName === null) { // ユーザーがキャンセルした場合
      return;
    }

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

  downloadSvgButton.addEventListener("click", () => {
    const svgString = svgOutput.innerHTML;
    if (!svgString) {
      alert("SVGが生成されていません。");
      return;
    }

    let fileName = prompt("ダウンロードするSVGファイル名を入力してください:", "output.svg");

    if (fileName === null) { // ユーザーがキャンセルした場合
      return;
    }

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

  // 初期表示用のサンプルSPDテキスト
  spdInput.value = `:terminal START\n\n#ロジックを記述してください\nロジック\n\n:terminal END`;
  convertAndRender(); // ページロード時に一度変換を実行
});
