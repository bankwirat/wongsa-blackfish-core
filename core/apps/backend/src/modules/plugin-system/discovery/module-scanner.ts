import { readdir, readFile, stat } from 'fs/promises'
import { join, resolve } from 'path'
import type { ModuleMetadata, ModuleManifest } from '../types/module.types'

/**
 * Scans modules directory and discovers all modules
 */
export class ModuleScanner {
  private modulesPath: string

  constructor(modulesPath?: string) {
    // Use provided path, environment variable, or resolve relative to this file
    this.modulesPath = modulesPath || 
      process.env.MODULES_PATH || 
      resolve(__dirname, '../../../../modules')
  }

  /**
   * Scan and discover all modules
   * Scans both modules/ directory and packages/@wongsa/* workspace packages
   */
  async scanModules(): Promise<ModuleMetadata[]> {
    console.log('[Module Scanner] 🔍 Starting module scan...')
    console.log('[Module Scanner] Modules path:', this.modulesPath)
    const modules: ModuleMetadata[] = []

    try {
      // Step 1: Scan local modules directory
      console.log('[Module Scanner] 📁 Step 1: Scanning local modules directory:', this.modulesPath)
      const localModules = await this.scanDirectory(this.modulesPath)
      console.log(`[Module Scanner] ✅ Found ${localModules.length} module(s) in local directory:`, localModules.map(m => m.id))
      modules.push(...localModules)

      // Step 2: Scan workspace packages
      // Use process.cwd() which should be the project root when running from backend
      // If running from backend directory, go up to project root
      let projectRoot = process.cwd()
      // If we're in core/apps/backend, go up 3 levels to project root
      if (projectRoot.endsWith('core/apps/backend')) {
        projectRoot = resolve(projectRoot, '../../../')
      } else if (projectRoot.endsWith('/backend')) {
        projectRoot = resolve(projectRoot, '../../')
      }
      const workspaceModulesPath = resolve(projectRoot, 'packages/@wongsa')
      console.log('[Module Scanner] 📦 Step 2: Scanning workspace packages:', workspaceModulesPath)
      const workspaceModules = await this.scanDirectory(workspaceModulesPath)
      console.log(`[Module Scanner] ✅ Found ${workspaceModules.length} module(s) in workspace packages:`, workspaceModules.map(m => m.id))
      modules.push(...workspaceModules)
      
      console.log(`[Module Scanner] 🎉 Total modules discovered: ${modules.length}`)
      modules.forEach(m => {
        console.log(`[Module Scanner]   - ${m.id} v${m.manifest.version} (path: ${m.path})`)
      })
    } catch (error) {
      console.error('[Module Scanner] ❌ Error scanning modules:', error)
      if (error instanceof Error) {
        console.error('[Module Scanner] Error details:', {
          message: error.message,
          stack: error.stack,
        })
      }
    }

    return modules
  }

  /**
   * Scan a directory for modules
   */
  private async scanDirectory(directoryPath: string): Promise<ModuleMetadata[]> {
    const modules: ModuleMetadata[] = []
    console.log(`[Module Scanner] 📂 Scanning directory: ${directoryPath}`)

    try {
      // Check if directory exists
      const dirExists = await this.directoryExists(directoryPath)
      if (!dirExists) {
        console.log(`[Module Scanner] ⚠️ Directory does not exist: ${directoryPath}`)
        return modules
      }
      console.log(`[Module Scanner] ✅ Directory exists: ${directoryPath}`)

      // Read all items in directory
      const entries = await readdir(directoryPath, { withFileTypes: true })
      console.log(`[Module Scanner] 📋 Found ${entries.length} entries in directory`)

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          console.log(`[Module Scanner] ⏭️ Skipping non-directory: ${entry.name}`)
          continue
        }

        const moduleId = entry.name
        const modulePath = join(directoryPath, moduleId)
        console.log(`[Module Scanner] 🔎 Checking module: ${moduleId} at ${modulePath}`)
        
        try {
          const manifest = await this.loadManifest(modulePath)
          
          if (manifest && manifest.installable) {
            console.log(`[Module Scanner] ✅ Valid module found: ${moduleId}`, {
              name: manifest.name,
              version: manifest.version,
              installable: manifest.installable,
              hasBackend: !!manifest.backend,
              hasFrontend: !!manifest.frontend,
            })
            modules.push({
              id: moduleId,
              path: modulePath,
              manifest,
              enabled: false, // Will be loaded from database
              installed: false,
            })
          } else {
            console.log(`[Module Scanner] ⚠️ Module ${moduleId} is not installable or manifest is invalid`)
          }
        } catch (error) {
          console.error(`[Module Scanner] ❌ Error loading module ${moduleId}:`, error)
          if (error instanceof Error) {
            console.error(`[Module Scanner] Error details:`, error.message)
          }
        }
      }
    } catch (error) {
      // Silently fail if directory doesn't exist (not an error)
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[Module Scanner] ❌ Error scanning directory ${directoryPath}:`, error)
      } else {
        console.log(`[Module Scanner] ℹ️ Directory not found (not an error): ${directoryPath}`)
      }
    }

    console.log(`[Module Scanner] 📊 Directory scan complete. Found ${modules.length} module(s)`)
    return modules
  }

  /**
   * Load manifest.json from module directory
   */
  private async loadManifest(modulePath: string): Promise<ModuleManifest | null> {
    const manifestPath = join(modulePath, 'manifest.json')
    console.log(`[Module Scanner] 📄 Loading manifest: ${manifestPath}`)
    
    try {
      const manifestContent = await readFile(manifestPath, 'utf-8')
      console.log(`[Module Scanner] ✅ Manifest file read successfully`)
      const manifest = JSON.parse(manifestContent) as ModuleManifest
      console.log(`[Module Scanner] 📋 Manifest parsed:`, {
        name: manifest.name,
        version: manifest.version,
        installable: manifest.installable,
        hasBackend: !!manifest.backend,
        hasFrontend: !!manifest.frontend,
      })
      
      // Validate required fields
      if (!manifest.name || !manifest.version) {
        throw new Error('Manifest missing required fields: name, version')
      }

      return manifest
    } catch (error) {
      console.error(`[Module Scanner] ❌ Failed to load manifest from ${manifestPath}:`, error)
      if (error instanceof Error) {
        console.error(`[Module Scanner] Error details:`, error.message)
      }
      return null
    }
  }

  /**
   * Check if directory exists
   */
  private async directoryExists(path: string): Promise<boolean> {
    try {
      const stats = await stat(path)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Validate module dependencies
   */
  async validateDependencies(
    module: ModuleMetadata,
    availableModules: ModuleMetadata[]
  ): Promise<{ valid: boolean; missing: string[] }> {
    const depends = module.manifest.depends || []
    const availableIds = availableModules.map(m => m.id)
    const missing = depends.filter(dep => !availableIds.includes(dep))

    return {
      valid: missing.length === 0,
      missing,
    }
  }
}

