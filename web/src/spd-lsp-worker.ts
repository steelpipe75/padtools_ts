// web/src/spd-lsp-worker.ts

import { EmptyFileSystem } from "langium";
import { startLanguageServer } from "langium/lsp";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
  createConnection,
} from "vscode-languageserver/browser";
import { createSpdServices } from "../../src/spd/langium/spd-module";

const workerScope = self as unknown as DedicatedWorkerGlobalScope;
const messageReader = new BrowserMessageReader(workerScope);
const messageWriter = new BrowserMessageWriter(workerScope);

const connection = createConnection(messageReader, messageWriter);

const { shared } = createSpdServices({ connection, ...EmptyFileSystem });

startLanguageServer(shared);
