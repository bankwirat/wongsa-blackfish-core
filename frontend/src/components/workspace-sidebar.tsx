'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Folder, 
  BarChart3, 
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface WorkspaceSidebarProps {
  workspaceSlug?: string
  workspaceName?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function WorkspaceSidebar({ 
  workspaceSlug: propWorkspaceSlug,
  workspaceName = 'Workspace', 
  isCollapsed = false, 
  onToggleCollapse 
}: WorkspaceSidebarProps) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  
  // Use prop workspaceSlug first, fallback to params
  const workspaceSlug = propWorkspaceSlug || (params.slug as string)

  // If workspaceSlug is not available, don't render navigation
  if (!workspaceSlug) {
    return (
      <div className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/workspace/${workspaceSlug}/dashboard`,
      icon: LayoutDashboard,
      current: pathname === `/workspace/${workspaceSlug}/dashboard`
    },
    {
      name: 'Members',
      href: `/workspace/${workspaceSlug}/members`,
      icon: Users,
      current: pathname === `/workspace/${workspaceSlug}/members`
    },
    {
      name: 'Projects',
      href: `/workspace/${workspaceSlug}/projects`,
      icon: Folder,
      current: pathname === `/workspace/${workspaceSlug}/projects`
    },
    {
      name: 'Analytics',
      href: `/workspace/${workspaceSlug}/analytics`,
      icon: BarChart3,
      current: pathname === `/workspace/${workspaceSlug}/analytics`
    },
    {
      name: 'Settings',
      href: `/workspace/${workspaceSlug}/settings`,
      icon: Settings,
      current: pathname === `/workspace/${workspaceSlug}/settings`
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">
                {workspaceName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground text-sm">
                {workspaceName}
              </h2>
              <p className="text-xs text-sidebar-foreground/70">Workspace</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
                  item.current ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                } ${isCollapsed ? 'px-2' : 'px-3'}`}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <Bell className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && (
            <>
              Notifications
              <Badge variant="destructive" className="ml-auto">3</Badge>
            </>
          )}
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <HelpCircle className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Help'}
        </Button>

        {/* Switch Workspace */}
        <Link href="/">
          <Button
            variant="ghost"
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
          >
            <Folder className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && 'Switch Workspace'}
          </Button>
        </Link>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  )
}
