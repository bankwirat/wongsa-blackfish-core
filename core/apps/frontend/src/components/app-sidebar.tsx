"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  GalleryVerticalEnd,
  AudioWaveform,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { createNavData } from "@/lib/nav-utils"
import { apiClient } from "@/lib/api-client"
import { pluginRegistry } from "@/lib/plugin-registry"
import type { Workspace } from "@/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// This is sample data for teams (workspaces will be loaded dynamically)
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const workspaceSlug = params.slug as string
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [pluginNavItems, setPluginNavItems] = useState<Array<{ id: string; name: string; icon?: string; route: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load workspaces
        const workspacesData = await apiClient.getWorkspaces()
        setWorkspaces(workspacesData)
        
        // Load plugins
        console.log('[App Sidebar] Loading plugins...')
        await pluginRegistry.loadPlugins()
        
        // Debug: Check enabled modules
        const enabledModules = await apiClient.getEnabledModules()
        console.log('[App Sidebar] Enabled modules from API:', enabledModules)
        
        // Get plugin navigation items
        const navItems = pluginRegistry.getPluginNavItems()
        console.log('[App Sidebar] Plugin nav items:', navItems)
        setPluginNavItems(navItems)
      } catch (error) {
        console.error('Error loading sidebar data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Create nav data with plugin items
  const navData = createNavData(workspaceSlug, pluginNavItems)

  // Convert workspaces to team format for TeamSwitcher
  const teams = workspaces.map((workspace) => ({
    name: workspace.name,
    logo: GalleryVerticalEnd, // Default icon for all workspaces
    plan: workspace.isActive ? 'Active' : 'Inactive',
    slug: workspace.slug,
  }))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
