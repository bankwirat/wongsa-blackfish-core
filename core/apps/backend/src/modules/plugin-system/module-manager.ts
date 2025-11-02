import { ModuleScanner } from './discovery/module-scanner'
import { ModuleRegistry } from './registry/module-registry'
import { ModuleLoader } from './loader/module-loader'
import type { ModuleMetadata, LoadedModule } from './types/module.types'
import * as path from 'path'

/**
 * Module Manager - Main orchestrator for module system
 */
export class ModuleManager {
  private scanner: ModuleScanner
  private registry: ModuleRegistry
  private loader: ModuleLoader
  private modulesPath: string

  constructor(modulesPath?: string) {
    // Resolve modules path from environment variable or relative to backend source
    this.modulesPath = modulesPath || 
      process.env.MODULES_PATH || 
      path.resolve(__dirname, '../../../modules')
    
    this.scanner = new ModuleScanner(this.modulesPath)
    this.registry = ModuleRegistry.getInstance()
    this.loader = new ModuleLoader()
  }

  /**
   * Initialize module system - discover and load modules
   */
  async initialize(enabledModuleIds: string[] = []): Promise<void> {
    console.log('[Module Manager] 🚀 Initializing module system...')
    console.log('[Module Manager] 📝 Enabled module IDs to load:', enabledModuleIds)
    console.log('[Module Manager] 📂 Modules path:', this.modulesPath)
    
    // Step 1: Discover all modules
    console.log('[Module Manager] 🔍 Step 1: Discovering modules...')
    const discoveredModules = await this.scanner.scanModules()
    
    console.log(`[Module Manager] ✅ Step 1 Complete: Found ${discoveredModules.length} module(s):`)
    discoveredModules.forEach(m => {
      console.log(`[Module Manager]   - ${m.id} v${m.manifest.version} at ${m.path}`)
    })

    // Step 2: Register discovered modules
    console.log('[Module Manager] 📋 Step 2: Registering discovered modules...')
    discoveredModules.forEach(module => {
      this.registry.registerDiscovered(module)
      console.log(`[Module Manager]   ✅ Registered: ${module.id}`)
    })

    // Step 3: Validate dependencies
    console.log('[Module Manager] 🔗 Step 3: Validating dependencies...')
    await this.validateAllDependencies(discoveredModules)
    console.log('[Module Manager] ✅ Step 3 Complete: All dependencies valid')

    // Step 4: Enable modules (from database or parameter)
    console.log(`[Module Manager] ⚙️ Step 4: Enabling ${enabledModuleIds.length} module(s)...`)
    enabledModuleIds.forEach(id => {
      const success = this.registry.enable(id)
      if (success) {
        console.log(`[Module Manager]   ✅ Enabled: ${id}`)
      } else {
        console.warn(`[Module Manager]   ⚠️ Failed to enable: ${id} (not found in discovered modules)`)
      }
    })

    // Step 5: Load enabled modules
    const enabledModules = this.registry.getEnabled()
    console.log(`[Module Manager] 🚀 Step 5: Loading ${enabledModules.length} enabled module(s)...`)
    console.log(`[Module Manager] 📦 Modules to load:`, enabledModules.map(m => m.id))
    
    await this.loader.loadModules(enabledModules)
    
    const loaded = this.registry.getAllLoaded()
    console.log(`[Module Manager] ✅ Step 5 Complete: Loaded ${loaded.length} module(s) successfully`)
    console.log(`[Module Manager] 🎉 Module system initialization complete!`)
  }

  /**
   * Enable a module
   */
  async enableModule(moduleId: string): Promise<boolean> {
    const module = this.registry.getDiscovered(moduleId)
    if (!module) {
      return false
    }

    // Validate dependencies
    const deps = await this.scanner.validateDependencies(
      module,
      this.registry.getAllDiscovered()
    )
    
    if (!deps.valid) {
      throw new Error(
        `Module ${moduleId} has missing dependencies: ${deps.missing.join(', ')}`
      )
    }

    this.registry.enable(moduleId)
    await this.loader.loadModule(module)
    
    return true
  }

  /**
   * Disable a module
   */
  async disableModule(moduleId: string): Promise<boolean> {
    this.loader.unloadModule(moduleId)
    return true
  }

  /**
   * Get all modules
   */
  getAllModules(): ModuleMetadata[] {
    return this.registry.getAllDiscovered()
  }

  /**
   * Get enabled modules
   */
  getEnabledModules(): ModuleMetadata[] {
    return this.registry.getEnabled()
  }

  /**
   * Get loaded modules
   */
  getLoadedModules(): LoadedModule[] {
    return this.registry.getAllLoaded()
  }

  /**
   * Validate all module dependencies
   */
  private async validateAllDependencies(
    modules: ModuleMetadata[]
  ): Promise<void> {
    for (const module of modules) {
      const validation = await this.scanner.validateDependencies(module, modules)
      if (!validation.valid) {
        console.warn(
          `⚠️  Module ${module.id} has missing dependencies: ${validation.missing.join(', ')}`
        )
      }
    }
  }
}

