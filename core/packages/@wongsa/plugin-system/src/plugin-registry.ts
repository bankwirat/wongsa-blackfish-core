import type { PluginModule } from './plugin-types'

/**
 * Plugin Registry - Singleton for managing plugin modules
 */
export class PluginRegistry {
  private static instance: PluginRegistry
  private plugins: Map<string, PluginModule> = new Map()

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry()
    }
    return PluginRegistry.instance
  }

  /**
   * Register a plugin module
   */
  register(plugin: PluginModule): void {
    // Check for route conflicts
    if (this.findByRoute(plugin.route)) {
      console.warn(
        `Plugin route conflict: Route "${plugin.route}" already registered. Plugin "${plugin.id}" will override.`
      )
    }

    this.plugins.set(plugin.id, plugin)
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin?.destroy) {
      plugin.destroy()
    }
    this.plugins.delete(pluginId)
  }

  /**
   * Get all registered plugins
   */
  getAll(): PluginModule[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugin by ID
   */
  getById(id: string): PluginModule | null {
    return this.plugins.get(id) || null
  }

  /**
   * Find plugin by route path
   */
  findByRoute(path: string): PluginModule | null {
    // Exact match first
    for (const plugin of this.plugins.values()) {
      if (plugin.route === path) {
        return plugin
      }
    }

    // Try route matchers for dynamic routes
    for (const plugin of this.plugins.values()) {
      if (plugin.routeMatcher) {
        const match = plugin.routeMatcher(path)
        if (match !== null) {
          return plugin
        }
      }
    }

    return null
  }

  /**
   * Get all plugins with routes (for navigation)
   */
  getRoutes(): Array<{ path: string; plugin: PluginModule }> {
    return Array.from(this.plugins.values())
      .filter((p) => p.route)
      .map((p) => ({
        path: p.route,
        plugin: p,
      }))
  }

  /**
   * Get enabled plugins filtered by permissions
   */
  getEnabled(requiredPermissions?: string[]): PluginModule[] {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return this.getAll()
    }

    return this.getAll().filter((plugin) => {
      if (!plugin.permissions || plugin.permissions.length === 0) {
        return true // No permissions required
      }

      // Check if user has at least one required permission
      return plugin.permissions.some((permission) => requiredPermissions.includes(permission))
    })
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.forEach((plugin) => {
      if (plugin.destroy) {
        plugin.destroy()
      }
    })
    this.plugins.clear()
  }
}

// Export singleton instance
export const pluginRegistry = PluginRegistry.getInstance()

