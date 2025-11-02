import { Injectable, OnModuleInit } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { PrismaService } from '../../prisma/prisma.service'
import { ModuleManager } from './module-manager'

@Injectable()
export class ModulesService implements OnModuleInit {
  private moduleManager: ModuleManager

  constructor(
    private prisma: PrismaService,
    private moduleRef: ModuleRef,
  ) {
    this.moduleManager = new ModuleManager()
  }

  async onModuleInit() {
    console.log('[Modules Service] 🚀 Initializing module system...')
    const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    console.log('[Modules Service] Environment:', process.env.NODE_ENV || 'not set (defaulting to development)')
    console.log('[Modules Service] Is Development Mode:', isDevelopment)
    
    // Load enabled modules from database
    console.log('[Modules Service] 📊 Querying database for enabled modules...')
    const enabledModules = await this.prisma.module.findMany({
      where: { enabled: true },
      select: { moduleId: true },
    })
    console.log(`[Modules Service] 📋 Found ${enabledModules.length} enabled module(s) in database:`, enabledModules.map(m => m.moduleId))

    const enabledIds = enabledModules.map(m => m.moduleId)
    console.log(`[Modules Service] 📝 Enabled module IDs:`, enabledIds)
    
    // Initialize module system first to discover modules
    console.log('[Modules Service] 🔄 Initializing module manager...')
    await this.moduleManager.initialize(enabledIds)
    
    // Auto-enable modules in development mode (if not already enabled)
    if (isDevelopment) {
      console.log('[Modules Service] 🔧 Development mode detected - checking for auto-enable...')
      const allModules = this.moduleManager.getAllModules()
      console.log(`[Modules Service] 📦 Total discovered modules: ${allModules.length}`)
      console.log(`[Modules Service] 📋 Discovered modules:`, allModules.map(m => ({ id: m.id, enabled: enabledIds.includes(m.id) })))
      
      const modulesToAutoEnable = allModules.filter(
        m => !enabledIds.includes(m.id) && m.manifest.installable
      )
      console.log(`[Modules Service] 🎯 Modules to auto-enable: ${modulesToAutoEnable.length}`, modulesToAutoEnable.map(m => m.id))
      
      if (modulesToAutoEnable.length > 0) {
        console.log(`[Modules Service] 🔧 Development mode: Auto-enabling ${modulesToAutoEnable.length} module(s)...`)
        for (const module of modulesToAutoEnable) {
          try {
            console.log(`[Modules Service] ⚙️ Enabling module: ${module.id}...`)
            await this.enable(module.id)
            console.log(`[Modules Service] ✅ Auto-enabled: ${module.id}`)
          } catch (error) {
            console.warn(`[Modules Service] ⚠️ Failed to auto-enable ${module.id}:`, error)
            if (error instanceof Error) {
              console.warn(`[Modules Service] Error details:`, error.message, error.stack)
            }
          }
        }
      } else {
        console.log(`[Modules Service] ℹ️ No modules to auto-enable (all are already enabled or not installable)`)
      }
    } else {
      console.log('[Modules Service] ℹ️ Not in development mode - skipping auto-enable')
    }
    
    console.log('[Modules Service] ✅ Module system initialization complete')
  }

  /**
   * Register loaded module controllers with NestJS
   */
  private async registerModuleControllers() {
    try {
      const loadedModules = this.moduleManager.getLoadedModules()
      console.log('[Modules Service] 🔧 Registering module controllers with NestJS...')
      
      const moduleControllers: any[] = []
      const moduleProviders: any[] = []
      
      loadedModules.forEach(loadedModule => {
        if (loadedModule.backendControllers) {
          moduleControllers.push(...loadedModule.backendControllers.filter(Boolean))
        }
        if (loadedModule.backendServices) {
          moduleProviders.push(...loadedModule.backendServices.filter(Boolean))
        }
      })
      
      console.log(`[Modules Service] 📋 Found ${moduleControllers.length} controller(s) and ${moduleProviders.length} provider(s) to register`)
      
      // Log controller details
      moduleControllers.forEach(controller => {
        if (controller) {
          const controllerName = controller.name || 'Unknown'
          console.log(`[Modules Service] ✅ Controller: ${controllerName}`)
        }
      })
      
      // Note: NestJS doesn't support dynamic controller registration after module initialization
      // Controllers must be included in the module definition.
      // The PluginSystemModule handles this via static imports
    } catch (error) {
      console.error('[Modules Service] ❌ Error registering module controllers:', error)
    }
  }

  /**
   * Get all modules
   */
  async findAll() {
    console.log('[Modules Service] 📊 Getting all modules...')
    const allModules = this.moduleManager.getAllModules()
    console.log(`[Modules Service] 🔍 Discovered modules: ${allModules.length}`, allModules.map(m => m.id))
    
    // Get status from database
    console.log('[Modules Service] 📊 Querying database for module status...')
    const dbModules = await this.prisma.module.findMany()
    console.log(`[Modules Service] 📋 Database modules: ${dbModules.length}`, dbModules.map(m => ({ id: m.moduleId, enabled: m.enabled })))
    const dbModuleMap = new Map(dbModules.map(m => [m.moduleId, m]))
    
    const result = allModules.map(module => {
      const dbModule = dbModuleMap.get(module.id)
      const enabled = dbModule?.enabled || false
      console.log(`[Modules Service] 📦 Module ${module.id}: enabled=${enabled}`, {
        hasDbRecord: !!dbModule,
        enabled,
        installed: dbModule?.installed || false,
      })
      return {
        ...module,
        enabled,
        installed: dbModule?.installed || false,
        installedAt: dbModule?.installedAt,
      }
    })
    
    const enabledCount = result.filter(m => m.enabled).length
    console.log(`[Modules Service] ✅ Returning ${result.length} module(s), ${enabledCount} enabled`)
    
    return result
  }

  /**
   * Get module by ID
   */
  async findOne(moduleId: string) {
    const module = this.moduleManager.getAllModules().find(m => m.id === moduleId)
    if (!module) {
      return null
    }

    const dbModule = await this.prisma.module.findUnique({
      where: { moduleId },
    })

    return {
      ...module,
      enabled: dbModule?.enabled || false,
      installed: dbModule?.installed || false,
      installedAt: dbModule?.installedAt,
    }
  }

  /**
   * Enable a module
   */
  async enable(moduleId: string) {
    console.log(`[Modules Service] ⚙️ Enabling module: ${moduleId}...`)
    
    // Check if module exists
    const allModules = this.moduleManager.getAllModules()
    const module = allModules.find(m => m.id === moduleId)
    if (!module) {
      console.error(`[Modules Service] ❌ Module ${moduleId} not found in discovered modules`)
      console.error(`[Modules Service] Available modules:`, allModules.map(m => m.id))
      throw new Error(`Module ${moduleId} not found`)
    }
    console.log(`[Modules Service] ✅ Module found: ${module.id} v${module.manifest.version}`)
    
    console.log(`[Modules Service] 🔄 Enabling module via module manager...`)
    await this.moduleManager.enableModule(moduleId)
    console.log(`[Modules Service] ✅ Module enabled in module manager`)
    
    // Update database
    console.log(`[Modules Service] 💾 Updating database...`)
    const moduleManifest = module.manifest
    const dbModule = await this.prisma.module.upsert({
      where: { moduleId },
      update: { enabled: true },
      create: {
        moduleId,
        name: moduleManifest.name || moduleId,
        version: moduleManifest.version || '1.0.0',
        category: moduleManifest.category || null,
        enabled: true,
        installed: true,
        installedAt: new Date(),
      },
    })
    console.log(`[Modules Service] ✅ Database updated:`, {
      moduleId: dbModule.moduleId,
      enabled: dbModule.enabled,
      installed: dbModule.installed,
    })

    console.log(`[Modules Service] 🎉 Module ${moduleId} enabled successfully`)
    return { message: `Module ${moduleId} enabled successfully` }
  }

  /**
   * Disable a module
   */
  async disable(moduleId: string) {
    await this.moduleManager.disableModule(moduleId)
    
    // Update database
    await this.prisma.module.update({
      where: { moduleId },
      data: { enabled: false },
    })

    return { message: `Module ${moduleId} disabled successfully` }
  }

  /**
   * Get module manager instance
   */
  getModuleManager(): ModuleManager {
    return this.moduleManager
  }
}

