import { type LucideIcon } from "lucide-react"

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
  // For sub-items: /workspace/my-workspace/settings/general
  return `${baseUrl}/${parentItem.title.toLowerCase().replace(/\s+/g, '-')}/${subItem.slug}`
}

/**
 * Creates navigation structure with auto-generated URLs
 * @param workspaceSlug - The workspace slug
 * @returns Navigation data with generated URLs
 */
export function createNavData(workspaceSlug: string) {
  return {
    navMain: [
      {
        title: "Dashboard",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Overview",
            slug: "overview",
          },
          {
            title: "Analytics",
            slug: "analytics",
          },
          {
            title: "Reports",
            slug: "reports",
          },
        ],
      },
      {
        title: "Projects",
        icon: Bot,
        items: [
          {
            title: "All Projects",
            slug: "all",
          },
          {
            title: "Active",
            slug: "active",
          },
          {
            title: "Archived",
            slug: "archived",
          },
        ],
      },
      {
        title: "Team",
        icon: BookOpen,
        items: [
          {
            title: "Members",
            slug: "members",
          },
          {
            title: "Roles",
            slug: "roles",
          },
          {
            title: "Invitations",
            slug: "invitations",
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
          {
            title: "Billing",
            slug: "billing",
          },
          {
            title: "Integrations",
            slug: "integrations",
          },
          {
            title: "Security",
            slug: "security",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Help & Support",
        slug: "help",
        icon: LifeBuoy,
      },
      {
        title: "Documentation",
        slug: "docs",
        icon: BookOpen,
      },
    ],
  }
}

// Import icons (you'll need to add these imports)
import { 
  SquareTerminal, 
  Bot, 
  BookOpen, 
  Settings2, 
  LifeBuoy 
} from "lucide-react"
