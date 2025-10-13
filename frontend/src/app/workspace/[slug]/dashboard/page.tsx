'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Folder, BarChart3, Settings } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Workspace } from '@/types'
import Link from 'next/link'

export default function WorkspaceDashboardPage() {
  const { user, loading, logout } = useAuth()
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (workspaceId && user) {
      loadWorkspace()
    }
  }, [workspaceId, user])

  const loadWorkspace = async () => {
    try {
      setWorkspaceLoading(true)
      setError(null)
      const workspaceData = await apiClient.getWorkspaceById(workspaceId)
      setWorkspace(workspaceData)
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load workspace'
      setError(errorMessage)
      console.error('Error loading workspace:', err)
    } finally {
      setWorkspaceLoading(false)
    }
  }

  if (loading || workspaceLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            Back to Workspaces
          </Button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Members",
      value: workspace?.members?.length?.toString() || "0",
      change: "+2 from last month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Projects",
      value: "12",
      change: "+3 from last month",
      icon: Folder,
      trend: "up"
    },
    {
      title: "Tasks Completed",
      value: "89",
      change: "+12 from last month",
      icon: BarChart3,
      trend: "up"
    }
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-4 p-6">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to {workspace?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here&apos;s what&apos;s happening in your workspace today.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/workspace/${workspaceId}/members`}>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Members
                </Button>
              </Link>
              <Link href={`/workspace/${workspaceId}/settings`}>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage your workspace team and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/workspace/${workspaceId}/members`}>
                  <Button variant="outline" className="w-full">
                    View Members
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Workspace Settings
                </CardTitle>
                <CardDescription>
                  Configure your workspace preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/workspace/${workspaceId}/settings`}>
                  <Button variant="outline" className="w-full">
                    Open Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Projects
                </CardTitle>
                <CardDescription>
                  Create and manage your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Projects
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates in your workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New member joined the workspace</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Project &quot;Website Redesign&quot; was updated</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Workspace settings were modified</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
