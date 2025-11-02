/**
 * Module manifest structure (like Odoo's __manifest__.py)
 */
export interface ModuleManifest {
  name: string
  version: string
  category?: string
  depends?: string[] // Module dependencies
  author?: string
  description?: string
  installable: boolean
  
  backend?: {
    controllers?: string[] // Paths to controller files
    services?: string[] // Paths to service files
    models?: string[] // Paths to model files
    routes?: ModuleRoute[] // Route definitions
    providers?: string[] // NestJS providers
  }
  
  frontend?: {
    plugins?: string[] // Paths to frontend plugin files
    components?: string[] // Paths to component files
  }
}

export interface ModuleRoute {
  path: string
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  controller: string
  action: string
}

export interface ModuleMetadata {
  id: string // Module folder name
  path: string // Full path to module
  manifest: ModuleManifest
  enabled: boolean
  installed: boolean
  installedAt?: Date
}

export interface LoadedModule {
  metadata: ModuleMetadata
  backendControllers?: any[]
  backendServices?: any[]
  frontendPlugins?: any[]
}

