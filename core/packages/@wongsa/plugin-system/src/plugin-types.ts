import type { User, Workspace, WorkspaceMember } from '@wongsa/core-shared/types'
import type { ApiClient } from '@wongsa/core-shared/api-client'
import type { ComponentType } from 'react'

/**
 * Workspace context that plugins receive during initialization
 */
export interface WorkspaceContext {
  api: ApiClient
  workspace: Workspace
  user: User
  workspaceMember: WorkspaceMember
  eventBus?: EventBus
}

/**
 * Event bus interface for plugin communication
 */
export interface EventBus {
  emit(event: string, data?: any): void
  on(event: string, handler: (data?: any) => void): void
  off(event: string, handler: (data?: any) => void): void
}

/**
 * Plugin route matcher function for dynamic routes
 */
export type RouteMatcher = (path: string) => Record<string, string> | null

/**
 * Plugin module interface - all plugins must implement this
 */
export interface PluginModule {
  /** Unique plugin identifier */
  id: string

  /** Display name of the plugin */
  name: string

  /** Plugin version */
  version: string

  /** Icon name (Lucide icon or custom) */
  icon?: string

  /** Route path (e.g., 'analytics' or 'sales/orders') */
  route: string

  /** React component to render for this plugin */
  component?: ComponentType<{ params?: Record<string, string> }>

  /** Route matcher for dynamic routes (e.g., 'projects/[id]') */
  routeMatcher?: RouteMatcher

  /** Required permissions for plugin access */
  permissions?: string[]

  /** Initialize plugin with workspace context */
  init?: (context: WorkspaceContext) => Promise<void> | void

  /** Cleanup when plugin is removed */
  destroy?: () => Promise<void> | void

  /** Plugin metadata */
  metadata?: {
    description?: string
    author?: string
    category?: string
    [key: string]: any
  }
}

/**
 * Plugin navigation item for sidebar/menu
 */
export interface PluginNavItem {
  id: string
  name: string
  icon?: string
  route: string
  children?: PluginNavItem[]
}

