'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { pluginRegistry } from '@/lib/plugin-registry'
import type { PluginModule } from '@wongsa/plugin-system'
import type { Workspace, User, WorkspaceMember } from '@/types'

export default function PluginRoutePage() {
  const params = useParams()
  const slug = params.slug as string
  const path = (params.path as string[]) || []
  const route = path.join('/')
  
  const [plugin, setPlugin] = useState<PluginModule | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('[Plugin Route Page] 🔄 Route changed:', { route, path, slug, params })
    loadPlugin()
  }, [route, slug])

  const loadPlugin = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[Plugin Route Page] 🚀 Starting plugin load process...')
      console.log('[Plugin Route Page] 📍 Route:', route)
      console.log('[Plugin Route Page] 🏢 Workspace slug:', slug)
      console.log('[Plugin Route Page] 📦 Path params:', path)

      // Load plugins from registry
      console.log('[Plugin Route Page] 🔄 Step 1: Loading plugins from registry...')
      await pluginRegistry.loadPlugins()
      
      // Debug: Check what plugins were loaded
      const allPlugins = pluginRegistry.getAllPlugins()
      console.log(`[Plugin Route Page] ✅ Step 1 Complete: ${allPlugins.length} plugin(s) loaded`)
      console.log('[Plugin Route Page] 📋 Loaded plugins:', allPlugins.map(p => ({ 
        id: p.id, 
        route: p.route, 
        name: p.name,
        hasComponent: !!p.component,
      })))
      
      // Find plugin matching the route
      console.log(`[Plugin Route Page] 🔍 Step 2: Searching for plugin with route: "${route}"...`)
      console.log(`[Plugin Route Page] 📐 Route details:`, {
        route,
        routeLength: route.length,
        isEmpty: route === '',
        pathArray: path,
        pathLength: path.length,
        slug
      })
      
      // Handle empty route (might be root of workspace)
      if (!route || route === '') {
        console.log('[Plugin Route Page] ℹ️ Empty route - this might be the workspace root')
        setError('No plugin route specified')
        setLoading(false)
        return
      }
      
      const foundPlugin = pluginRegistry.getPluginByRoute(route)
      
      if (!foundPlugin) {
        const availablePlugins = pluginRegistry.getAllPlugins()
        console.error('[Plugin Route Page] ❌ Step 2 Failed: Plugin not found')
        console.error('[Plugin Route Page] 📋 Available plugins:', availablePlugins.map(p => ({ id: p.id, route: p.route })))
        console.error('[Plugin Route Page] 🔍 Route matching details:', {
          targetRoute: route,
          targetRouteType: typeof route,
          availableRoutes: availablePlugins.map(p => p.route),
          routeMatches: availablePlugins.map(p => ({
            route: p.route,
            exactMatch: p.route === route,
            startsWith: route.startsWith(p.route + '/'),
            routeIncludes: route.includes(p.route),
          })),
        })
        setError(`Plugin not found for route: "${route}". Available routes: ${availablePlugins.map(p => p.route).join(', ') || 'none'}`)
        setLoading(false)
        return
      }

      console.log(`[Plugin Route Page] ✅ Step 2 Complete: Found plugin "${foundPlugin.id}"`)
      console.log('[Plugin Route Page] 📦 Plugin details:', {
        id: foundPlugin.id,
        name: foundPlugin.name,
        route: foundPlugin.route,
        hasComponent: !!foundPlugin.component,
        hasInit: !!foundPlugin.init,
      })

      // Load workspace and user context
      console.log('[Plugin Route Page] 🔄 Step 3: Loading workspace and user context...')
      const [workspaceData, userData] = await Promise.all([
        apiClient.getWorkspaceBySlug(slug),
        apiClient.getProfile(),
      ])
      console.log('[Plugin Route Page] ✅ Step 3 Complete:', {
        workspaceId: workspaceData.id,
        workspaceSlug: workspaceData.slug,
        userId: userData.id,
        userEmail: userData.email,
      })

      // Get workspace member info
      console.log('[Plugin Route Page] 🔄 Step 4: Fetching workspace members...')
      const members = await apiClient.getWorkspaceMembers(workspaceData.id)
      const workspaceMember = members.find(m => m.userId === userData.id)
      console.log('[Plugin Route Page] ✅ Step 4 Complete:', {
        totalMembers: members.length,
        isMember: !!workspaceMember,
        memberRole: workspaceMember?.role,
      })

      if (!workspaceMember) {
        console.error('[Plugin Route Page] ❌ User is not a member of this workspace')
        setError('You are not a member of this workspace')
        setLoading(false)
        return
      }

      setWorkspace(workspaceData)
      setUser(userData)
      setPlugin(foundPlugin)

      // Initialize plugin with context
      console.log('[Plugin Route Page] 🔄 Step 5: Initializing plugin with context...')
      if (foundPlugin.init) {
        await foundPlugin.init({
          api: apiClient,
          workspace: workspaceData,
          user: userData,
          workspaceMember,
        })
        console.log('[Plugin Route Page] ✅ Step 5 Complete: Plugin initialized')
      } else {
        console.log('[Plugin Route Page] ℹ️ Step 5: Plugin has no init method')
      }
      
      console.log('[Plugin Route Page] 🎉 Plugin load process complete!')
    } catch (err) {
      console.error('Error loading plugin:', err)
      setError(err instanceof Error ? err.message : 'Failed to load plugin')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!plugin || !plugin.component) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">404</h1>
          <p className="text-gray-600">Plugin page not found</p>
        </div>
      </div>
    )
  }

  // Render plugin component with workspace context
  const PluginComponent = plugin.component
  return <PluginComponent params={{ slug, ...Object.fromEntries(path.map((p, i) => [`param${i}`, p])) }} />
}
