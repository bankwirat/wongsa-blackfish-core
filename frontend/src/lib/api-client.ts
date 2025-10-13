import axios, { type AxiosInstance } from 'axios'
import Cookies from 'js-cookie'
import type { User, Workspace, WorkspaceMember, AuthResponse, LoginRequest, RegisterRequest, CreateWorkspaceRequest, AddMemberRequest } from '@/types'

class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle auth errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          // Try to refresh the token
          const newAccessToken = await this.refreshAccessToken()
          
          if (newAccessToken) {
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return this.client(originalRequest)
          } else {
            // Refresh failed, redirect to login
            this.clearAuthTokens()
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', userData)
    return response.data
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/auth/profile')
    return response.data
  }

  async logout(): Promise<void> {
    await this.client.post<void>('/auth/logout')
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/users')
    return response.data
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`)
    return response.data
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.client.patch<User>(`/users/${id}`, userData)
    return response.data
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete<void>(`/users/${id}`)
  }

  // Workspace methods
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await this.client.get<Workspace[]>('/workspaces')
    return response.data
  }

  async getWorkspaceById(id: string): Promise<Workspace> {
    const response = await this.client.get<Workspace>(`/workspaces/${id}`)
    return response.data
  }

  async getWorkspaceBySlug(slug: string): Promise<Workspace> {
    const response = await this.client.get<Workspace>(`/workspaces/slug/${slug}`)
    return response.data
  }

  async createWorkspace(workspaceData: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await this.client.post<Workspace>('/workspaces', workspaceData)
    return response.data
  }

  async createDefaultWorkspace(): Promise<Workspace> {
    const response = await this.client.post<Workspace>('/workspaces/default')
    return response.data
  }

  async updateWorkspace(id: string, workspaceData: Partial<CreateWorkspaceRequest>): Promise<Workspace> {
    const response = await this.client.patch<Workspace>(`/workspaces/${id}`, workspaceData)
    return response.data
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.client.delete<void>(`/workspaces/${id}`)
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await this.client.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)
    return response.data
  }

  async addWorkspaceMember(workspaceId: string, memberData: AddMemberRequest): Promise<WorkspaceMember> {
    const response = await this.client.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, memberData)
    return response.data
  }

  async removeWorkspaceMember(workspaceId: string, memberId: string): Promise<void> {
    await this.client.delete<void>(`/workspaces/${workspaceId}/members/${memberId}`)
  }

  // Method to set auth tokens
  public setAuthTokens(accessToken: string, refreshToken: string): void {
    Cookies.set('access_token', accessToken, { expires: 1/96 }) // 15 minutes
    Cookies.set('refresh_token', refreshToken, { expires: 7 }) // 7 days
  }

  // Method to clear auth tokens
  public clearAuthTokens(): void {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  }

  // Method to get current access token
  public getAuthToken(): string | undefined {
    return Cookies.get('access_token')
  }

  // Method to get refresh token
  public getRefreshToken(): string | undefined {
    return Cookies.get('refresh_token')
  }

  // Method to refresh access token
  public async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    try {
      const response = await this.client.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshToken
      })
      
      this.setAuthTokens(response.data.access_token, response.data.refresh_token)
      return response.data.access_token
    } catch (error) {
      this.clearAuthTokens()
      return null
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()