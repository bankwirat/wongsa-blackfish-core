// User interface for backend auth
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  members: WorkspaceMember[]
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  firstName: string
  lastName: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface CreateWorkspaceRequest {
  name: string
  slug: string
  description?: string
  isActive?: boolean
}

export interface UpdateWorkspaceRequest {
  name?: string
  slug?: string
  description?: string
  isActive?: boolean
}

export interface AddMemberRequest {
  email: string
  role?: 'owner' | 'admin' | 'member'
}