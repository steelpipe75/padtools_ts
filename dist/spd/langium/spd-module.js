import { EmptyFileSystem, inject } from "langium";
import { createDefaultModule, createDefaultSharedModule, } from "langium/lsp";
import { SpdGeneratedModule, spdGeneratedSharedModule, } from "./generated/module.js";
import { SpdLexer } from "./spd-lexer.js";
export function createSpdServices(context = EmptyFileSystem) {
    const shared = inject(createDefaultSharedModule(context), spdGeneratedSharedModule);
    const Spd = inject(createDefaultModule({ shared }), SpdGeneratedModule, {
        parser: {
            Lexer: (services) => new SpdLexer(services),
        },
    });
    shared.ServiceRegistry.register(Spd);
    return { shared, Spd };
}
export const spdServices = createSpdServices().Spd;
