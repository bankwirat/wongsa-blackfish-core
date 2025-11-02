'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, MoreHorizontal, UserPlus, Mail } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Workspace, WorkspaceMember } from '@/types'
import Link from 'next/link'

export default function WorkspaceMembersPage() {
  const { user, loading, logout } = useAuth()
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.id as string
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [workspaceLoading, setWorkspaceLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (workspaceId && user) {
      loadWorkspace()
      loadMembers()
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

  const loadMembers = async () => {
    try {
      setMembersLoading(true)
      const membersData = await apiClient.getWorkspaceMembers(workspaceId)
      setMembers(membersData)
    } catch (err: unknown) {
      console.error('Error loading members:', err)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    try {
      setAddingMember(true)
      await apiClient.addWorkspaceMember(workspaceId, {
        email: newMemberEmail,
        role: 'member'
      })
      setNewMemberEmail('')
      setShowAddMember(false)
      await loadMembers() // Refresh members list
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add member'
      setError(errorMessage)
      console.error('Error adding member:', err)
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await apiClient.removeWorkspaceMember(workspaceId, memberId)
      await loadMembers() // Refresh members list
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to remove member'
      setError(errorMessage)
      console.error('Error removing member:', err)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'member':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const filteredMembers = members.filter(member =>
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading || workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-4 p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Team Members
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your workspace team and permissions
              </p>
            </div>
            <Button onClick={() => setShowAddMember(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Search and Stats */}
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Member</CardTitle>
                <CardDescription>
                  Invite a new member to join this workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={addingMember}>
                    {addingMember ? 'Adding...' : 'Add Member'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddMember(false)
                      setNewMemberEmail('')
                    }}
                  >
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <div className="grid gap-4">
            {membersLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">Loading members...</div>
                </CardContent>
              </Card>
            ) : filteredMembers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    {searchTerm ? 'No members found matching your search.' : 'No members found.'}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.user?.firstName?.[0] || member.user?.email?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.user?.firstName && member.user?.lastName
                              ? `${member.user.firstName} ${member.user.lastName}`
                              : member.user?.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.user?.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                        {member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
