'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Search } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface SalesOrder {
  id: string
  orderNumber: string
  customer: string
  amount: number | string
  status: 'pending' | 'processing' | 'completed'
  date: string | Date
  workspaceId: string
}

export default function SalesOrderPage({ params }: { params?: Record<string, string> }) {
  const urlParams = useParams()
  const workspaceSlug = params?.slug || (urlParams.slug as string)
  
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [workspaceSlug])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get workspace to get workspaceId
      const workspace = await apiClient.getWorkspaceBySlug(workspaceSlug)
      setWorkspaceId(workspace.id)

      // Fetch sales orders for this workspace
      const orders = await apiClient.client.get<SalesOrder[]>('/sales/orders', {
        params: { workspaceId: workspace.id }
      })
      
      setSalesOrders(orders.data.map(order => ({
        ...order,
        amount: typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount,
        date: typeof order.date === 'string' ? new Date(order.date).toLocaleDateString() : new Date(order.date).toLocaleDateString()
      })))
    } catch (err) {
      console.error('Error loading sales orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sales orders')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading sales orders...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadData} className="mt-4">Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  const totalRevenue = salesOrders.reduce((sum, o) => {
    const amount = typeof o.amount === 'number' ? o.amount : parseFloat(String(o.amount))
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Sales Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your sales orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesOrders.filter(o => o.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>List of all sales orders</CardDescription>
        </CardHeader>
        <CardContent>
          {salesOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales orders found. Create your first order!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Order ID</th>
                    <th className="text-left p-3 font-medium">Customer</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOrders.map((order) => {
                    const amount = typeof order.amount === 'number' ? order.amount : parseFloat(String(order.amount))
                    return (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono">{order.orderNumber}</td>
                        <td className="p-3">{order.customer}</td>
                        <td className="p-3">${isNaN(amount) ? '0.00' : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3">{typeof order.date === 'string' ? order.date : new Date(order.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

