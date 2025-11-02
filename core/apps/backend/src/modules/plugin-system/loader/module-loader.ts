import { join } from 'path'
import { register } from 'module'
import type { ModuleMetadata, LoadedModule } from '../types/module.types'
import { ModuleRegistry } from '../registry/module-registry'

// Register ts-node hook for TypeScript imports at runtime
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  })
} catch (error) {
  console.warn('[Module Loader] ⚠️ ts-node not available, TypeScript imports may fail')
}

/**
 * Module Loader - Loads module code into application
 */
export class ModuleLoader {
  private registry = ModuleRegistry.getInstance()

  /**
   * Load a module's backend code
   */
  async loadModule(module: ModuleMetadata): Promise<LoadedModule> {
    console.log(`[Module Loader] 🔄 Loading module: ${module.id}...`)
    console.log(`[Module Loader] 📂 Module path: ${module.path}`)
    const loaded: LoadedModule = {
      metadata: module,
    }

    // Load backend components if defined
    if (module.manifest.backend) {
      console.log(`[Module Loader] 🔧 Loading backend components for ${module.id}...`)
      const { controllers, services, models } = module.manifest.backend

      if (controllers && controllers.length > 0) {
        console.log(`[Module Loader] 📋 Loading ${controllers.length} controller(s)...`)
        loaded.backendControllers = await this.loadFiles(
          module.path,
          controllers
        )
        console.log(`[Module Loader] ✅ Loaded ${loaded.backendControllers?.length || 0} controller(s)`)
      }

      if (services && services.length > 0) {
        console.log(`[Module Loader] 📋 Loading ${services.length} service(s)...`)
        loaded.backendServices = await this.loadFiles(
          module.path,
          services
        )
        console.log(`[Module Loader] ✅ Loaded ${loaded.backendServices?.length || 0} service(s)`)
      }

      if (models && models.length > 0) {
        console.log(`[Module Loader] 📋 Loading ${models.length} model(s)...`)
        await this.loadFiles(module.path, models)
        console.log(`[Module Loader] ✅ Loaded ${models.length} model(s)`)
      }
    } else {
      console.log(`[Module Loader] ℹ️ No backend components for ${module.id}`)
    }

    // Load frontend plugins if defined
    if (module.manifest.frontend?.plugins) {
      console.log(`[Module Loader] 🎨 Loading frontend plugins for ${module.id}...`)
      loaded.frontendPlugins = await this.loadFiles(
        module.path,
        module.manifest.frontend.plugins
      )
      console.log(`[Module Loader] ✅ Loaded ${loaded.frontendPlugins?.length || 0} frontend plugin(s)`)
    } else {
      console.log(`[Module Loader] ℹ️ No frontend plugins for ${module.id}`)
    }

    console.log(`[Module Loader] ✅ Module ${module.id} loaded successfully`)
    return loaded
  }

  /**
   * Load multiple modules in dependency order
   */
  async loadModules(modules: ModuleMetadata[]): Promise<LoadedModule[]> {
    const loadOrder = this.registry.getLoadOrder()
    const loaded: LoadedModule[] = []

    for (const moduleId of loadOrder) {
      const module = modules.find(m => m.id === moduleId)
      if (module && this.registry.isEnabled(moduleId)) {
        try {
          const loadedModule = await this.loadModule(module)
          this.registry.registerLoaded(loadedModule)
          loaded.push(loadedModule)
        } catch (error) {
          console.error(`Failed to load module ${moduleId}:`, error)
        }
      }
    }

    return loaded
  }

  /**
   * Load files from module path
   */
  private async loadFiles(
    modulePath: string,
    filePaths: string[]
  ): Promise<any[]> {
    const loaded: any[] = []
    console.log(`[Module Loader] 📁 Loading ${filePaths.length} file(s) from ${modulePath}...`)

    for (const filePath of filePaths) {
      try {
        console.log(`[Module Loader] 📄 Loading file: ${filePath}`)
        // Resolve path - handle both absolute and relative
        let fullPath: string
        if (filePath.startsWith('./') || filePath.startsWith('../')) {
          fullPath = join(modulePath, filePath)
        } else {
          fullPath = filePath
        }
        console.log(`[Module Loader] 📍 Resolved path: ${fullPath}`)

        // Use require() with ts-node for TypeScript files
        // fullPath is already absolute from join() above
        let module
        console.log(`[Module Loader] 🔍 Loading module with ts-node: ${fullPath}`)
        
        try {
          // ts-node.register() handles .ts extension automatically
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          module = require(fullPath)
          console.log(`[Module Loader] ✅ Loaded via require() with ts-node`)
        } catch (requireError) {
          console.error(`[Module Loader] ❌ Failed to require module`, {
            path: fullPath,
            error: (requireError as Error).message,
          })
          throw requireError
        }
        
        console.log(`[Module Loader] 📦 Module exports:`, {
          hasDefault: !!module.default,
          namedExports: Object.keys(module).filter(k => k !== 'default'),
          allKeys: Object.keys(module),
        })
        
        // Extract exports
        if (module.default) {
          console.log(`[Module Loader] ✅ Adding default export`)
          loaded.push(module.default)
        }
        // Also get named exports
        Object.values(module).forEach(exp => {
          if (exp && typeof exp === 'function' && exp.name) {
            if (!loaded.includes(exp)) {
              console.log(`[Module Loader] ✅ Adding named export: ${exp.name}`)
              loaded.push(exp)
            }
          }
        })
        console.log(`[Module Loader] ✅ File loaded successfully. Total exports: ${loaded.length}`)
      } catch (error) {
        console.error(`[Module Loader] ❌ Failed to load file ${filePath} from module ${modulePath}:`, error)
        if (error instanceof Error) {
          console.error(`[Module Loader] Error details:`, {
            message: error.message,
            stack: error.stack,
          })
        }
        // Continue loading other files even if one fails
      }
    }

    console.log(`[Module Loader] 📊 Loaded ${loaded.length} export(s) from ${filePaths.length} file(s)`)
    return loaded
  }

  /**
   * Unload a module
   */
  unloadModule(moduleId: string): void {
    this.registry.disable(moduleId)
    // Additional cleanup if needed
  }
}

