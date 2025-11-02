'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Workspace } from '@/types'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const workspaceSlug = params.slug as string
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (workspaceSlug && user) {
      loadWorkspace()
    }
  }, [workspaceSlug, user])

  const loadWorkspace = async () => {
    try {
      setWorkspaceLoading(true)
      const workspaceData = await apiClient.getWorkspaceBySlug(workspaceSlug)
      setWorkspace(workspaceData)
    } catch (error) {
      console.error('Error loading workspace:', error)
      // If user doesn't have access, redirect to home
      router.push('/')
    } finally {
      setWorkspaceLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access this workspace</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (workspaceLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading workspace...</div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have access to this workspace</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Workspaces
          </button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/workspace/${workspaceSlug}`}>
                    {workspace.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
