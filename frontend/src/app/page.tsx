'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect to first available workspace
      const redirectToWorkspace = async () => {
        try {
          const workspaces = await apiClient.getWorkspaces()
          if (workspaces.length > 0) {
            router.push(`/workspace/${workspaces[0].slug}/dashboard`)
          } else {
            // No workspaces found - create a default workspace with generated name
            try {
              const defaultWorkspace = await apiClient.createDefaultWorkspace()
              // Redirect to the newly created workspace
              router.push(`/workspace/${defaultWorkspace.slug}/dashboard`)
            } catch (createError) {
              console.error('Error creating default workspace:', createError)
              // If workspace creation fails, stay on home page
            }
          }
        } catch (error) {
          console.error('Error fetching workspaces:', error)
          // Error fetching workspaces - try to create a default workspace with generated name
          try {
            const defaultWorkspace = await apiClient.createDefaultWorkspace()
            // Redirect to the newly created workspace
            router.push(`/workspace/${defaultWorkspace.slug}/dashboard`)
          } catch (createError) {
            console.error('Error creating default workspace:', createError)
            // If workspace creation fails, stay on home page
          }
        }
      }
      redirectToWorkspace()
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Wongsa Core
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your modern SAAS platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/login">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full">Register</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}