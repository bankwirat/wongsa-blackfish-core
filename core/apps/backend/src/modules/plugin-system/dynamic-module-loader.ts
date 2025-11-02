import { DynamicModule, Type } from '@nestjs/common'
import type { LoadedModule } from './types/module.types'

/**
 * Dynamic Module Loader for NestJS
 * Registers module controllers/services dynamically
 */
export class DynamicModuleLoader {
  /**
   * Create a dynamic NestJS module from loaded module
   */
  static createModule(loadedModule: LoadedModule): DynamicModule {
    // Collect all controllers and providers
    const controllers: Type<any>[] = []
    const providers: Type<any>[] = []

    if (loadedModule.backendControllers) {
      controllers.push(...loadedModule.backendControllers.filter(Boolean))
    }

    if (loadedModule.backendServices) {
      providers.push(...loadedModule.backendServices.filter(Boolean))
    }

    return {
      module: class {} as Type<any>,
      controllers,
      providers,
      exports: providers,
    }
  }

  /**
   * Load module file and extract exports
   */
  static async loadModuleFile(filePath: string): Promise<any[]> {
    try {
      const module = await import(filePath)
      const exports: any[] = []

      // Get default export
      if (module.default) {
        exports.push(module.default)
      }

      // Get named exports (controllers, services, etc.)
      Object.values(module).forEach(exportItem => {
        if (exportItem && typeof exportItem === 'function' && exportItem.name) {
          exports.push(exportItem)
        }
      })

      return exports
    } catch (error) {
      console.error(`Failed to load module file ${filePath}:`, error)
      return []
    }
  }
}

