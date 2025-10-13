'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Save, Users, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Workspace, UpdateWorkspaceRequest } from '@/types'

// Form schema matching Prisma Workspace model
const workspaceSchema = z.object({
  name: z.string().min(2, {
    message: "Workspace name must be at least 2 characters.",
  }).max(100, {
    message: "Workspace name must be less than 100 characters.",
  }),
  slug: z.string().min(2, {
    message: "Workspace slug must be at least 2 characters.",
  }).max(50, {
    message: "Workspace slug must be less than 50 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
  description: z.string().max(500, {
    message: "Description must be less than 500 characters.",
  }).optional().or(z.literal("")),
  isActive: z.boolean(),
})

export default function WorkspaceSettingsPage() {
  const { user, loading, logout } = useAuth()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Workspace form matching Prisma schema
  const workspaceForm = useForm<z.infer<typeof workspaceSchema>>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  })

  // Load workspace data
  const loadWorkspaceData = useCallback(async () => {
    if (!id) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const workspaceData = await apiClient.getWorkspaceById(id)
      setWorkspace(workspaceData)
      
      // Update form with loaded data
      workspaceForm.reset({
        name: workspaceData.name,
        slug: workspaceData.slug,
        description: workspaceData.description || "",
        isActive: workspaceData.isActive,
      })
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load workspace data')
      console.error('Error loading workspace:', err)
    } finally {
      setIsLoading(false)
    }
  }, [id, workspaceForm])

  useEffect(() => {
    if (id) {
      loadWorkspaceData()
    }
  }, [id, loadWorkspaceData])

  const onWorkspaceSubmit = async (values: z.infer<typeof workspaceSchema>) => {
    if (!id) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const updateData: UpdateWorkspaceRequest = {
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        isActive: values.isActive,
      }
      
      const updatedWorkspace = await apiClient.updateWorkspace(id, updateData)
      setWorkspace(updatedWorkspace)
      
      // Show success message (you could add a toast notification here)
      console.log('Workspace updated successfully')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update workspace')
      console.error('Failed to update workspace:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!id) return
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this workspace? This action cannot be undone and will remove all data associated with this workspace.'
    )
    
    if (!confirmed) return
    
    try {
      setIsDeleting(true)
      setError(null)
      
      await apiClient.deleteWorkspace(id)
      
      // Redirect to home after successful deletion
      router.push('/')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete workspace')
      console.error('Failed to delete workspace:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 p-6">
        {/* Error Message */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !workspace && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading workspace...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workspace Info Card */}
        {workspace && (
          <Card>
            <CardHeader>
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription>
                Manage your workspace settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={workspace.isActive ? "default" : "secondary"}>
                  {workspace.isActive ? "Active" : "Inactive"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created on {new Date(workspace.createdAt).toLocaleDateString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  • Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workspace Settings Section */}
        {workspace && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Workspace Settings
              </CardTitle>
              <CardDescription>
                Update your workspace information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...workspaceForm}>
                <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-6">
                  <FormField
                    control={workspaceForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter workspace name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the display name for your workspace
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workspaceForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="workspace-slug" {...field} />
                        </FormControl>
                        <FormDescription>
                          Used in URLs and must be unique. Only lowercase letters, numbers, and hyphens allowed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workspaceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your workspace..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your workspace (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workspaceForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Workspace Status
                          </FormLabel>
                          <FormDescription>
                            Enable or disable this workspace
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone Section */}
        {workspace && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-destructive p-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-destructive">
                    Delete Workspace
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this workspace and all its data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteWorkspace}
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete Workspace'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
