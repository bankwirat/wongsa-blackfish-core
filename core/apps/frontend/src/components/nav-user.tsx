"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import type { User } from "@/types"

export function NavUser() {
  const { user, logout } = useAuth()
  const { isMobile } = useSidebar()

  if (!user) {
    return null
  }

  // Handle both old format (firstName/lastName directly) and new format (user_metadata)
  const firstName = user.user_metadata?.firstName || (user as any).firstName || ''
  const lastName = user.user_metadata?.lastName || (user as any).lastName || ''
  const avatarUrl = user.user_metadata?.avatarUrl || (user as any).avatarUrl
  
  // Debug: Log avatar URL to see what's being passed
  console.log('NavUser - Full user object:', user)
  console.log('NavUser - avatarUrl:', avatarUrl)
  console.log('NavUser - user_metadata:', user.user_metadata)
  console.log('NavUser - Direct avatarUrl:', (user as any).avatarUrl)
  
  // Test with a known working image URL
  const testAvatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  console.log('NavUser - Testing with known URL:', testAvatarUrl)
  
  // Test if the Google avatar URL loads in a regular img tag
  const testImage = new Image()
  testImage.onload = () => console.log('Google avatar loads successfully in Image object')
  testImage.onerror = () => console.log('Google avatar fails to load in Image object')
  testImage.src = avatarUrl
  
  const displayName = `${firstName} ${lastName}`.trim() || 'User'
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage 
                  src={avatarUrl || testAvatarUrl} 
                  alt={displayName}
                  onError={(e) => {
                    console.log('Avatar image failed to load:', avatarUrl || testAvatarUrl)
                    console.log('Error details:', e)
                    console.log('Target:', e.target)
                  }}
                  onLoad={() => console.log('Avatar image loaded successfully:', avatarUrl || testAvatarUrl)}
                />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={displayName}
                    onError={(e) => {
                      console.log('Dropdown avatar image failed to load:', avatarUrl)
                      console.log('Error details:', e)
                      console.log('Target:', e.target)
                    }}
                    onLoad={() => console.log('Dropdown avatar image loaded successfully:', avatarUrl)}
                  />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
