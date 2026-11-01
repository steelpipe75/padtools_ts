import { type DefaultSharedModuleContext, type LangiumServices, type LangiumSharedServices } from "langium/lsp";
export declare function createSpdServices(context?: DefaultSharedModuleContext): {
    shared: LangiumSharedServices;
    Spd: LangiumServices;
};
export declare const spdServices: LangiumServices;
