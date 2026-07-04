import { EmptyFileSystem } from 'langium';
import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { SpdGeneratedModule, spdGeneratedSharedModule } from './generated/module.js';

export function createSpdServices() {
    const shared = inject(
        createDefaultSharedCoreModule(EmptyFileSystem),
        spdGeneratedSharedModule
    );
    const Spd = inject(
        createDefaultCoreModule({ shared }),
        SpdGeneratedModule
    );
    shared.ServiceRegistry.register(Spd);
    return { shared, Spd };
}

export const spdServices = createSpdServices().Spd;
