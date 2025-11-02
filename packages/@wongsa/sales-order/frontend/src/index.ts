import type { PluginModule } from '@wongsa/plugin-system'
import SalesOrderPage from './SalesOrderPage'

/**
 * Sales Order Plugin - Frontend
 */
const salesOrderPlugin: PluginModule = {
  id: 'sales-order',
  name: 'Sales Orders',
  version: '1.0.0',
  icon: 'ShoppingCart',
  route: 'sales/orders',
  component: SalesOrderPage,
  permissions: ['sales:read'],
  metadata: {
    description: 'Manage sales orders and transactions',
    category: 'sales',
    author: 'Wongsa Team'
  },
  async init(context) {
    console.log('Sales Order plugin initialized', context)
  },
  destroy() {
    console.log('Sales Order plugin destroyed')
  }
}

export default salesOrderPlugin

