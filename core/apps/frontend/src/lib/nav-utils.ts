import { type LucideIcon } from "lucide-react"
import { 
  SquareTerminal, 
  Settings2
} from "lucide-react"

export interface NavItem {
  title: string
  icon: LucideIcon
  isActive?: boolean
  items: NavSubItem[] // Make items required - main nav items should always have children
}

export interface NavSubItem {
  title: string
  slug: string
}

export interface NavSecondaryItem {
  title: string
  slug: string
  icon: LucideIcon
}

/**
 * Generates URL for sub-navigation items based on workspace slug and parent item
 * @param workspaceSlug - The workspace slug (e.g., "my-workspace")
 * @param parentItem - The parent navigation item
 * @param subItem - The sub-item
 * @returns Generated URL
 */
export function generateNavUrl(
  workspaceSlug: string,
  parentItem: NavItem,
  subItem: NavSubItem
): string {
  const baseUrl = `/workspace/${workspaceSlug}`
  
  // If subItem.slug contains '/', it's a plugin route and should be used directly
  // Plugin routes are like "sales/orders" and should be /workspace/slug/sales/orders
  // Core routes are like "general" and should be /workspace/slug/parent/general
  if (subItem.slug.includes('/')) {
    // Plugin route - use directly without parent prefix
    return `${baseUrl}/${subItem.slug}`
  }
  
  // Core route - use parent title prefix
  // For sub-items: /workspace/my-workspace/settings/general
  return `${baseUrl}/${parentItem.title.toLowerCase().replace(/\s+/g, '-')}/${subItem.slug}`
}

/**
 * Creates navigation structure with auto-generated URLs
 * @param workspaceSlug - The workspace slug
 * @param pluginNavItems - Optional plugin navigation items to merge
 * @returns Navigation data with generated URLs
 */
export function createNavData(workspaceSlug: string, pluginNavItems: Array<{ id: string; name: string; icon?: string; route: string }> = []) {
  const coreNavItems: NavItem[] = [
    {
      title: "Dashboard",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          slug: "overview",
        },
      ],
    },
    {
      title: "Settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          slug: "general",
        },
      ],
    },
  ]

  // Convert plugin nav items to NavItem format
  // For MVP, each plugin becomes a top-level nav item with a single sub-item
  const pluginNavItemsConverted: NavItem[] = pluginNavItems.map(plugin => {
    // Try to import icon dynamically - for now use a default
    let IconComponent: LucideIcon = SquareTerminal // Default fallback
    
    // Simple icon mapping - can be enhanced later
    if (plugin.icon) {
      try {
        // Dynamic icon import - will be handled by icon system later
        // For now, use default
      } catch {
        // Use default
      }
    }

    return {
      title: plugin.name,
      icon: IconComponent,
      isActive: false,
      items: [
        {
          title: plugin.name,
          slug: plugin.route,
        },
      ],
    }
  })

  return {
    navMain: [...coreNavItems, ...pluginNavItemsConverted],
    navSecondary: [],
  }
}
