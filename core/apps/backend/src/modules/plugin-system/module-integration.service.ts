import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleManager } from './module-manager'
import type { LoadedModule } from './types/module.types'

/**
 * Service to integrate loaded modules with NestJS
 * Registers controllers and providers dynamically
 */
@Injectable()
export class ModuleIntegrationService implements OnModuleInit {
  constructor(private moduleManager: ModuleManager) {}

  async onModuleInit() {
    // Modules are already loaded by ModulesService.onModuleInit
    // This service can be used for additional integration
    console.log('✅ Module integration complete')
  }

  /**
   * Get all loaded modules
   */
  getLoadedModules(): LoadedModule[] {
    return this.moduleManager.getLoadedModules()
  }

  /**
   * Get module controllers for dynamic registration
   */
  getModuleControllers(): any[] {
    const modules = this.getLoadedModules()
    const controllers: any[] = []

    modules.forEach(module => {
      if (module.backendControllers) {
        controllers.push(...module.backendControllers)
      }
    })

    return controllers
  }

  /**
   * Get module providers for dynamic registration
   */
  getModuleProviders(): any[] {
    const modules = this.getLoadedModules()
    const providers: any[] = []

    modules.forEach(module => {
      if (module.backendServices) {
        providers.push(...module.backendServices)
      }
    })

    return providers
  }
}

