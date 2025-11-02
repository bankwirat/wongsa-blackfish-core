import type { PluginModule } from '@wongsa/plugin-system'
import { apiClient } from './api-client'

/**
 * Plugin Registry - Manages frontend plugin modules
 */
class PluginRegistry {
  private plugins: Map<string, PluginModule> = new Map()
  private initialized = false

  /**
   * Plugin import map - Maps module IDs to their plugin imports
   * This needs to be updated when new modules are added
   * TODO: Auto-generate this from module manifests at build time
   * 
   * Note: Using relative paths from the frontend src directory
   * Path: core/apps/frontend/src/lib/ -> modules/sales-order/frontend/src/
   */
  private pluginImports: Record<string, () => Promise<{ default: PluginModule }>> = {
        'sales-order': async () => {
          try {
            console.log('[Plugin Registry] Attempting to load sales-order plugin...')

            let module
            let lastError: Error | null = null

            // Strategy 1: Try workspace package via npm package name
            try {
              module = await import('@wongsa/sales-order/frontend')
              console.log('[Plugin Registry] ✅ Loaded via workspace package (@wongsa/sales-order/frontend)')
            } catch (workspaceError) {
              lastError = workspaceError as Error
              console.log('[Plugin Registry] Workspace package import failed, trying relative path...', workspaceError)

              // Strategy 2: Try workspace package via relative path (from core/apps/frontend/src/lib/)
              // Up 5 levels to project root: ../../../../../ then packages/@wongsa/sales-order/frontend/src/index
              try {
                module = await import('../../../../../packages/@wongsa/sales-order/frontend/src/index')
                console.log('[Plugin Registry] ✅ Loaded via workspace package (relative path)')
              } catch (relativeError) {
                console.error('[Plugin Registry] ❌ All import strategies failed', {
                  workspaceError: (workspaceError as Error).message,
                  relativeError: (relativeError as Error).message,
                })
                throw lastError || relativeError
              }
            }

            if (!module || !module.default) {
              throw new Error('Module imported but default export is missing')
            }

            console.log('[Plugin Registry] ✅ Successfully imported sales-order plugin', {
              hasDefault: !!module.default,
              keys: Object.keys(module),
            })
            return module
          } catch (error) {
            console.error('[Plugin Registry] ❌ Failed to import sales-order plugin:', error)
            if (error instanceof Error) {
              console.error('[Plugin Registry] Error details:', {
                message: error.message,
                stack: error.stack,
              })
            }
            throw error
          }
        },
  }

  /**
   * Load and register all enabled module plugins
   */
  async loadPlugins(): Promise<void> {
    if (this.initialized) {
      console.log('[Plugin Registry] Already initialized, skipping load')
      return
    }

    try {
      console.log('[Plugin Registry] Starting plugin load process...')
      const enabledModules = await apiClient.getEnabledModules()
      console.log(`[Plugin Registry] Found ${enabledModules.length} enabled module(s):`, enabledModules.map(m => m.id || m.moduleId))
      
      for (const module of enabledModules) {
        const moduleId = module.id || module.moduleId
        console.log(`[Plugin Registry] Processing module:`, {
          id: moduleId,
          name: module.name,
          enabled: module.enabled,
          hasManifest: !!module.manifest,
          manifest: module.manifest,
          fullModule: module
        })
        
        // Check if we have an import for this module
        const importFn = this.pluginImports[moduleId]
        console.log(`[Plugin Registry] Import function for ${moduleId}:`, !!importFn)
        
        if (importFn) {
          try {
            console.log(`[Plugin Registry] Loading plugin for module: ${moduleId}`)
            // Import the plugin module
            const pluginModule = await importFn()
            console.log(`[Plugin Registry] Plugin module loaded:`, pluginModule)
            
            // Plugin should be default export
            const plugin: PluginModule = pluginModule.default
            console.log(`[Plugin Registry] Plugin object:`, plugin)
            
            if (plugin && plugin.id && plugin.component) {
              this.plugins.set(plugin.id, plugin)
              console.log(`[Plugin Registry] ✅ Successfully registered plugin: ${plugin.id} with route: ${plugin.route}`)
            } else {
              console.warn(`[Plugin Registry] ⚠️ Plugin missing required fields:`, {
                hasId: !!plugin?.id,
                hasComponent: !!plugin?.component,
                plugin
              })
            }
          } catch (error) {
            console.error(`[Plugin Registry] ❌ Failed to load plugin for module ${moduleId}:`, error)
            if (error instanceof Error) {
              console.error(`[Plugin Registry] Error stack:`, error.stack)
            }
          }
        } else {
          console.warn(`[Plugin Registry] ⚠️ No plugin import registered for module: ${moduleId}`)
          console.log(`[Plugin Registry] Available plugin imports:`, Object.keys(this.pluginImports))
        }
      }
      
      console.log(`[Plugin Registry] ✅ Plugin loading complete. Registered ${this.plugins.size} plugin(s)`)
      
      // Debug: Show all registered plugins
      if (this.plugins.size > 0) {
        console.log('[Plugin Registry] 📋 Registered plugins:', Array.from(this.plugins.entries()).map(([id, plugin]) => ({
          id,
          name: plugin.name,
          route: plugin.route,
          hasComponent: !!plugin.component,
        })))
        console.log('[Plugin Registry] 🎯 Plugin routes available:', Array.from(this.plugins.values()).map(p => p.route))
      } else {
        console.warn('[Plugin Registry] ⚠️ No plugins were registered!')
        console.warn('[Plugin Registry] 📊 Debug summary:')
        console.warn(`  - Enabled modules from API: ${enabledModules.length}`, enabledModules.map(m => m.id || m.moduleId))
        console.warn(`  - Available plugin imports: ${Object.keys(this.pluginImports).length}`, Object.keys(this.pluginImports))
        console.warn(`  - Module IDs match:`, enabledModules.map(m => {
          const moduleId = m.id || m.moduleId
          return { moduleId, hasImport: !!this.pluginImports[moduleId] }
        }))
        console.warn('[Plugin Registry] Possible reasons:')
        console.warn('  1. No modules are enabled')
        console.warn('  2. Module IDs don\'t match pluginImports keys')
        console.warn('  3. Plugin import paths are incorrect')
        console.warn('  4. Plugin components are not exporting correctly')
      }
      
      this.initialized = true
    } catch (error) {
      console.error('[Plugin Registry] ❌ Error loading plugins:', error)
      if (error instanceof Error) {
        console.error('[Plugin Registry] Error stack:', error.stack)
      }
    }
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginModule[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugin by ID
   */
  getPlugin(id: string): PluginModule | undefined {
    return this.plugins.get(id)
  }

  /**
   * Get plugin by route
   */
  getPluginByRoute(route: string): PluginModule | undefined {
    console.log(`[Plugin Registry] Looking for plugin with route: "${route}"`)
    console.log(`[Plugin Registry] Available plugins:`, Array.from(this.plugins.values()).map(p => ({ id: p.id, route: p.route })))
    
    // Try exact match first
    let found = Array.from(this.plugins.values()).find(
      plugin => plugin.route === route
    )
    
    // If not found, try prefix match
    if (!found) {
      found = Array.from(this.plugins.values()).find(
        plugin => route.startsWith(plugin.route + '/')
      )
    }
    
    // If still not found, try removing parent prefix (e.g., "sales-orders/sales/orders" -> "sales/orders")
    // This handles cases where navigation URLs were incorrectly generated with parent prefix
    if (!found && route.includes('/')) {
      const routeParts = route.split('/')
      // Try matching by skipping first segment if it looks like a parent prefix
      // Pattern: parent-slug/actual-route/rest
      for (let i = 1; i < routeParts.length; i++) {
        const candidateRoute = routeParts.slice(i).join('/')
        found = Array.from(this.plugins.values()).find(
          plugin => plugin.route === candidateRoute || candidateRoute.startsWith(plugin.route + '/')
        )
        if (found) {
          console.log(`[Plugin Registry] Found plugin by removing parent prefix: "${candidateRoute}"`)
          break
        }
      }
    }
    
    if (found) {
      console.log(`[Plugin Registry] ✅ Found plugin: ${found.id} for route: ${route}`)
    } else {
      console.warn(`[Plugin Registry] ⚠️ No plugin found for route: ${route}`)
    }
    
    return found
  }

  /**
   * Get navigation items from all plugins
   */
  getPluginNavItems(): Array<{ id: string; name: string; icon?: string; route: string }> {
    return Array.from(this.plugins.values()).map(plugin => ({
      id: plugin.id,
      name: plugin.name,
      icon: plugin.icon,
      route: plugin.route,
    }))
  }

  /**
   * Clear all plugins (for reloading)
   */
  clear(): void {
    this.plugins.clear()
    this.initialized = false
  }

  /**
   * Reload plugins
   */
  async reload(): Promise<void> {
    this.clear()
    await this.loadPlugins()
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry()
