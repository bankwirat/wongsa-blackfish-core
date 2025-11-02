'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Workspace, WorkspaceMember } from '@/types'
import { Save, Settings, Trash2, AlertTriangle, Users, Crown, Shield, User } from 'lucide-react'

export default function WorkspaceSettingsGeneralPage() {
  const { user, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const workspaceSlug = params.slug as string
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  })

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

  useEffect(() => {
    if (workspace) {
      loadMembers()
    }
  }, [workspace])

  const loadWorkspace = async () => {
    try {
      setWorkspaceLoading(true)
      setError(null)
      const workspaceData = await apiClient.getWorkspaceBySlug(workspaceSlug)
      setWorkspace(workspaceData)
      setFormData({
        name: workspaceData.name,
        slug: workspaceData.slug,
        description: workspaceData.description || '',
        isActive: workspaceData.isActive,
      })
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load workspace'
      setError(errorMessage)
      console.error('Error loading workspace:', err)
    } finally {
      setWorkspaceLoading(false)
    }
  }

  const loadMembers = async () => {
    if (!workspace) return

    try {
      setMembersLoading(true)
      const membersData = await apiClient.getWorkspaceMembers(workspace.id)
      setMembers(membersData)
    } catch (err: unknown) {
      console.error('Error loading members:', err)
    } finally {
      setMembersLoading(false)
    }
  }

  const validateSlug = (slug: string) => {
    // Check if slug is valid (lowercase, alphanumeric, hyphens only)
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    if (slug.length < 3) {
      return 'Slug must be at least 3 characters long'
    }
    if (slug.length > 50) {
      return 'Slug must be less than 50 characters'
    }
    return null
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  }

  const handleNameChange = (newName: string) => {
    setFormData({ ...formData, name: newName })
    // Always auto-generate slug when name changes
    const newSlug = generateSlug(newName)
    if (newSlug) {
      setFormData(prev => ({ ...prev, slug: newSlug }))
      const error = validateSlug(newSlug)
      setSlugError(error)
    }
  }

  const handleSlugChange = (newSlug: string) => {
    setFormData({ ...formData, slug: newSlug })
    const error = validateSlug(newSlug)
    setSlugError(error)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return

    // Validate slug before saving
    const slugValidationError = validateSlug(formData.slug)
    if (slugValidationError) {
      setSlugError(slugValidationError)
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSlugError(null)
      
      await apiClient.updateWorkspace(workspace.id, formData)
      
      // If slug changed, redirect to new URL
      if (formData.slug !== workspace.slug) {
        router.push(`/workspace/${formData.slug}/settings/general`)
      } else {
        // Reload workspace data
        await loadWorkspace()
      }
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save settings'
      setError(errorMessage)
      console.error('Error saving workspace:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!workspace) return

    if (deleteConfirmText !== workspace.name) {
      setError('Please type the workspace name exactly to confirm deletion')
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      
      await apiClient.deleteWorkspace(workspace.id)
      
      // Redirect to workspaces list or home
      router.push('/')
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete workspace'
      setError(errorMessage)
      console.error('Error deleting workspace:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'default' as const
      case 'admin':
        return 'secondary' as const
      default:
        return 'outline' as const
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push(`/workspace/${workspaceSlug}/dashboard`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1 flex flex-col gap-6 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                General Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your workspace settings and preferences.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Settings Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Information</CardTitle>
                <CardDescription>
                  Update your workspace name, description, and status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter workspace name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Workspace Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="my-workspace"
                    required
                    className={slugError ? 'border-red-500' : ''}
                  />
                  {slugError ? (
                    <p className="text-sm text-red-500">{slugError}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Auto-generated from workspace name. This will be your workspace URL: /workspace/{formData.slug || 'my-workspace'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter workspace description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Workspace is active</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workspace Details</CardTitle>
                <CardDescription>
                  Additional information about your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <Input
                      value={workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString() : ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <Input
                      value={workspace?.updatedAt ? new Date(workspace.updatedAt).toLocaleDateString() : ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workspace Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Workspace Members
                </CardTitle>
                <CardDescription>
                  Manage your workspace team members and their roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-lg">Loading members...</div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                    <p className="text-gray-500">Members will appear here once they join your workspace.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {member.user?.firstName?.charAt(0)}{member.user?.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">
                                {member.user?.firstName} {member.user?.lastName}
                              </h4>
                              <Badge variant={getRoleBadgeVariant(member.role)}>
                                <div className="flex items-center space-x-1">
                                  {getRoleIcon(member.role)}
                                  <span>{member.role}</span>
                                </div>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{member.user?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions. Please proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Delete Workspace
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Once you delete a workspace, there is no going back. This will permanently delete the workspace, all its data, and remove all members.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Workspace
                      </Button>
                    ) : (
                      <div className="space-y-4 p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
                        <div className="space-y-2">
                          <Label htmlFor="deleteConfirm" className="text-red-600 dark:text-red-400">
                            Type <span className="font-mono font-bold">{workspace?.name}</span> to confirm deletion:
                          </Label>
                          <Input
                            id="deleteConfirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder={workspace?.name}
                            className="border-red-300 focus:border-red-500 focus:ring-red-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={handleDeleteWorkspace}
                            disabled={isDeleting || deleteConfirmText !== workspace?.name}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Yes, Delete Workspace
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeleteConfirmText('')
                              setError(null)
                            }}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
