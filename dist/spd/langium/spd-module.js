import { EmptyFileSystem } from 'langium';
import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { SpdGeneratedModule, spdGeneratedSharedModule } from './generated/module.js';
import { SpdLexer } from './spd-lexer.js';
export function createSpdServices() {
    const shared = inject(createDefaultSharedCoreModule(EmptyFileSystem), spdGeneratedSharedModule);
    const Spd = inject(createDefaultCoreModule({ shared }), SpdGeneratedModule, {
        parser: {
            Lexer: (services) => new SpdLexer(services)
        }
    });
    shared.ServiceRegistry.register(Spd);
    return { shared, Spd };
}
export const spdServices = createSpdServices().Spd;
