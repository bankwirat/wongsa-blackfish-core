'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; firstName: string; lastName: string; password: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = apiClient.getAuthToken()
      if (!token) {
        setLoading(false)
        return
      }

      const userData = await apiClient.getProfile()
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      apiClient.clearAuthTokens()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.login({ email, password })
      apiClient.setAuthTokens(data.access_token, data.refresh_token)
      setUser(data.user)
      
      // Get user's workspaces and redirect to first available workspace
      try {
        const workspaces = await apiClient.getWorkspaces()
        if (workspaces.length > 0) {
          // Redirect to first workspace dashboard
          router.push(`/workspace/${workspaces[0].slug}/dashboard`)
        } else {
          // No workspaces found - create a default workspace with generated name
          try {
            const defaultWorkspace = await apiClient.createDefaultWorkspace()
            // Redirect to the newly created workspace
            router.push(`/workspace/${defaultWorkspace.slug}/dashboard`)
          } catch (createError) {
            console.error('Error creating default workspace:', createError)
            // If workspace creation fails, stay on current page
          }
        }
      } catch (workspaceError) {
        // If workspace fetch fails, try to create a default workspace with generated name
        console.error('Error fetching workspaces:', workspaceError)
        try {
          const defaultWorkspace = await apiClient.createDefaultWorkspace()
          // Redirect to the newly created workspace
          router.push(`/workspace/${defaultWorkspace.slug}/dashboard`)
        } catch (createError) {
          console.error('Error creating default workspace:', createError)
          // If workspace creation fails, stay on current page
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (data: { email: string; firstName: string; lastName: string; password: string }) => {
    try {
      const userData = await apiClient.register(data)
      apiClient.setAuthTokens(userData.access_token, userData.refresh_token)
      setUser(userData.user)
      
      // Get user's workspaces and redirect to first available workspace
      try {
        const workspaces = await apiClient.getWorkspaces()
        if (workspaces.length > 0) {
          // Redirect to first workspace dashboard
          router.push(`/workspace/${workspaces[0].slug}/dashboard`)
        } else {
          // No workspaces found - create a default workspace with generated name
          try {
            const defaultWorkspace = await apiClient.createDefaultWorkspace()
            // Redirect to the newly created workspace
            router.push(`/workspace/${defaultWorkspace.slug}/dashboard`)
          } catch (createError) {
            console.error('Error creating default workspace:', createError)
            // If workspace creation fails, stay on current page
          }
        }
      } catch (workspaceError) {
        // If workspace fetch fails, try to create a default workspace with generated name
        console.error('Error fetching workspaces:', workspaceError)
        try {
          const defaultWorkspace = await apiClient.createDefaultWorkspace()
          // Redirect to the newly created workspace
          router.push(`/workspace/${defaultWorkspace.slug}/dashboard`)
        } catch (createError) {
          console.error('Error creating default workspace:', createError)
          // If workspace creation fails, stay on current page
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    apiClient.clearAuthTokens()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
