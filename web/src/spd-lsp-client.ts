// web/src/spd-lsp-client.ts

import * as monaco from "monaco-editor";

interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: any;
  result?: any;
  error?: any;
}

export class SpdLspClient {
  private worker: Worker | null = null;
  private requestId = 1;
  private pendingRequests = new Map<
    number | string,
    {
      resolve: (result: any) => void;
      reject: (error: any) => void;
    }
  >();
  private currentModel: monaco.editor.ITextModel | null = null;
  private modelUri: string = "";
  private documentVersion = 1;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {}

  public async start(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // Web Worker を初期化
      this.worker = new Worker(
        new URL("./spd-lsp-worker.ts", import.meta.url),
        { type: "module" },
      );

      this.worker.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error("LSP Worker error:", error);
      };

      // initialize リクエストを送信
      await this.sendRequest("initialize", {
        processId: null,
        rootUri: null,
        capabilities: {
          textDocument: {
            synchronization: {
              dynamicRegistration: false,
              willSave: false,
              willSaveWaitUntil: false,
              didSave: false,
            },
            completion: {
              dynamicRegistration: false,
              completionItem: {
                snippetSupport: false,
                commitCharactersSupport: false,
                documentationFormat: ["plaintext", "markdown"],
                deprecatedSupport: true,
              },
            },
            publishDiagnostics: {
              relatedInformation: true,
              tagSupport: {
                valueSet: [1, 2],
              },
            },
            hover: {
              contentFormat: ["markdown", "plaintext"],
            },
          },
        },
      });

      // initialized 通知を送信
      this.sendNotification("initialized", {});
      this.isInitialized = true;
    })();

    return this.initPromise;
  }

  public bindModel(
    model: monaco.editor.ITextModel,
    languageId: string = "spd",
  ): void {
    this.currentModel = model;
    this.modelUri = model.uri.toString();
    this.documentVersion = 1;

    // 初期テキストをサーバーに didOpen
    const openDoc = () => {
      this.sendNotification("textDocument/didOpen", {
        textDocument: {
          uri: this.modelUri,
          languageId,
          version: this.documentVersion,
          text: model.getValue(),
        },
      });
    };

    if (this.isInitialized) {
      openDoc();
    } else if (this.initPromise) {
      this.initPromise.then(openDoc);
    }

    // モデル変更イベントの購読
    let debounceTimer: number | null = null;
    model.onDidChangeContent(() => {
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        if (!this.isInitialized) return;
        this.documentVersion++;
        this.sendNotification("textDocument/didChange", {
          textDocument: {
            uri: this.modelUri,
            version: this.documentVersion,
          },
          contentChanges: [
            {
              text: model.getValue(),
            },
          ],
        });
      }, 100);
    });
  }

  public registerProviders(languageId: string = "spd"): monaco.IDisposable[] {
    const disposables: monaco.IDisposable[] = [];

    // コード補完プロバイダー
    disposables.push(
      monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: [":", "@", "#", " "],
        provideCompletionItems: async (model, position) => {
          if (!this.isInitialized || model !== this.currentModel) {
            return { suggestions: [] };
          }

          try {
            const result = await this.sendRequest("textDocument/completion", {
              textDocument: { uri: this.modelUri },
              position: {
                line: position.lineNumber - 1,
                character: position.column - 1,
              },
            });

            if (!result) return { suggestions: [] };

            const items: any[] = Array.isArray(result)
              ? result
              : result.items || [];
            const wordUntil = model.getWordUntilPosition(position);
            const defaultRange = new monaco.Range(
              position.lineNumber,
              wordUntil.startColumn,
              position.lineNumber,
              wordUntil.endColumn,
            );

            const suggestions: monaco.languages.CompletionItem[] = items.map(
              (item) => ({
                label: item.label,
                kind: this.mapCompletionItemKind(item.kind),
                detail: item.detail,
                documentation: item.documentation,
                insertText: item.insertText || item.label,
                range: defaultRange,
              }),
            );

            return { suggestions };
          } catch (e) {
            console.warn("Failed to get completions from LSP:", e);
            return { suggestions: [] };
          }
        },
      }),
    );

    // ホバープロバイダー
    disposables.push(
      monaco.languages.registerHoverProvider(languageId, {
        provideHover: async (model, position) => {
          if (!this.isInitialized || model !== this.currentModel) {
            return null;
          }

          try {
            const result = await this.sendRequest("textDocument/hover", {
              textDocument: { uri: this.modelUri },
              position: {
                line: position.lineNumber - 1,
                character: position.column - 1,
              },
            });

            if (!result || !result.contents) return null;

            const contents: monaco.IMarkdownString[] = [];
            if (Array.isArray(result.contents)) {
              for (const c of result.contents) {
                contents.push({
                  value: typeof c === "string" ? c : c.value,
                });
              }
            } else if (typeof result.contents === "string") {
              contents.push({ value: result.contents });
            } else if (result.contents.value) {
              contents.push({ value: result.contents.value });
            }

            return { contents };
          } catch (e) {
            console.warn("Failed to get hover from LSP:", e);
            return null;
          }
        },
      }),
    );

    return disposables;
  }

  private handleMessage(message: JsonRpcMessage): void {
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);
      if (message.error) {
        reject(message.error);
      } else {
        resolve(message.result);
      }
      return;
    }

    if (message.method === "textDocument/publishDiagnostics") {
      this.handleDiagnostics(message.params);
    }
  }

  private handleDiagnostics(params: any): void {
    if (!this.currentModel || params.uri !== this.modelUri) {
      return;
    }

    const markers: monaco.editor.IMarkerData[] = (params.diagnostics || []).map(
      (diag: any) => ({
        severity: this.mapSeverity(diag.severity),
        message: diag.message,
        startLineNumber: diag.range.start.line + 1,
        startColumn: diag.range.start.character + 1,
        endLineNumber: diag.range.end.line + 1,
        endColumn: diag.range.end.character + 1,
        source: diag.source || "spd-lsp",
      }),
    );

    monaco.editor.setModelMarkers(this.currentModel, "spd-lsp", markers);
  }

  private mapSeverity(severity?: number): monaco.MarkerSeverity {
    switch (severity) {
      case 1:
        return monaco.MarkerSeverity.Error;
      case 2:
        return monaco.MarkerSeverity.Warning;
      case 3:
        return monaco.MarkerSeverity.Info;
      case 4:
        return monaco.MarkerSeverity.Hint;
      default:
        return monaco.MarkerSeverity.Error;
    }
  }

  private mapCompletionItemKind(kind?: number): monaco.languages.CompletionItemKind {
    switch (kind) {
      case 1:
        return monaco.languages.CompletionItemKind.Text;
      case 2:
        return monaco.languages.CompletionItemKind.Method;
      case 3:
        return monaco.languages.CompletionItemKind.Function;
      case 14:
        return monaco.languages.CompletionItemKind.Keyword;
      case 15:
        return monaco.languages.CompletionItemKind.Snippet;
      default:
        return monaco.languages.CompletionItemKind.Keyword;
    }
  }

  private sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        return reject(new Error("Worker is not running"));
      }
      const id = this.requestId++;
      this.pendingRequests.set(id, { resolve, reject });
      this.worker.postMessage({
        jsonrpc: "2.0",
        id,
        method,
        params,
      });
    });
  }

  private sendNotification(method: string, params: any): void {
    if (!this.worker) return;
    this.worker.postMessage({
      jsonrpc: "2.0",
      method,
      params,
    });
  }
}
