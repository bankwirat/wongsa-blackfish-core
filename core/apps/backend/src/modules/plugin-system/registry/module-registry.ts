import type { ModuleMetadata, LoadedModule } from '../types/module.types'

/**
 * Module Registry - Manages all discovered and loaded modules
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry
  private discoveredModules: Map<string, ModuleMetadata> = new Map()
  private loadedModules: Map<string, LoadedModule> = new Map()
  private enabledModules: Set<string> = new Set()

  private constructor() {}

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry()
    }
    return ModuleRegistry.instance
  }

  /**
   * Register discovered module
   */
  registerDiscovered(module: ModuleMetadata): void {
    this.discoveredModules.set(module.id, module)
  }

  /**
   * Register loaded module
   */
  registerLoaded(module: LoadedModule): void {
    this.loadedModules.set(module.metadata.id, module)
  }

  /**
   * Enable module
   */
  enable(moduleId: string): boolean {
    const module = this.discoveredModules.get(moduleId)
    if (!module) {
      return false
    }
    this.enabledModules.add(moduleId)
    return true
  }

  /**
   * Disable module
   */
  disable(moduleId: string): boolean {
    this.enabledModules.delete(moduleId)
    return true
  }

  /**
   * Check if module is enabled
   */
  isEnabled(moduleId: string): boolean {
    return this.enabledModules.has(moduleId)
  }

  /**
   * Get all discovered modules
   */
  getAllDiscovered(): ModuleMetadata[] {
    return Array.from(this.discoveredModules.values())
  }

  /**
   * Get all loaded modules
   */
  getAllLoaded(): LoadedModule[] {
    return Array.from(this.loadedModules.values())
  }

  /**
   * Get enabled modules
   */
  getEnabled(): ModuleMetadata[] {
    return Array.from(this.enabledModules)
      .map(id => this.discoveredModules.get(id))
      .filter((m): m is ModuleMetadata => m !== undefined)
  }

  /**
   * Get module by ID
   */
  getDiscovered(moduleId: string): ModuleMetadata | undefined {
    return this.discoveredModules.get(moduleId)
  }

  /**
   * Get loaded module by ID
   */
  getLoaded(moduleId: string): LoadedModule | undefined {
    return this.loadedModules.get(moduleId)
  }

  /**
   * Clear all modules
   */
  clear(): void {
    this.discoveredModules.clear()
    this.loadedModules.clear()
    this.enabledModules.clear()
  }

  /**
   * Get module dependency order
   */
  getLoadOrder(): string[] {
    const modules = this.getAllDiscovered()
    const loaded: string[] = []
    const loading = new Set<string>()

    const loadModule = (moduleId: string) => {
      if (loaded.includes(moduleId)) return
      if (loading.has(moduleId)) {
        throw new Error(`Circular dependency detected: ${moduleId}`)
      }

      loading.add(moduleId)
      const module = this.discoveredModules.get(moduleId)
      
      if (module?.manifest.depends) {
        for (const dep of module.manifest.depends) {
          if (dep !== 'core') { // 'core' is always available
            loadModule(dep)
          }
        }
      }

      loading.delete(moduleId)
      if (!loaded.includes(moduleId)) {
        loaded.push(moduleId)
      }
    }

    for (const module of modules) {
      loadModule(module.id)
    }

    return loaded
  }
}

