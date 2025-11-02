import { DynamicModule, Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { ModuleManager } from './module-manager'
import { ModulesController } from './modules.controller'
import { ModulesService } from './modules.service'
import { PrismaService } from '../../prisma/prisma.service'

// Statically import known controllers for now
// TODO: Make this fully dynamic using RouterModule after app bootstrap
// Import SalesOrder module components - using relative path that TypeScript can resolve
// From: core/apps/backend/src/modules/plugin-system/
// To: packages/@wongsa/sales-order/backend/src/index.ts
import { SalesOrderController } from '../../../../../../packages/@wongsa/sales-order/backend/src/index'
import { SalesOrderService } from '../../../../../../packages/@wongsa/sales-order/backend/src/index'

const moduleControllers: any[] = [SalesOrderController]
const moduleProviders: any[] = [SalesOrderService]

console.log('[PluginSystemModule] Registering module controllers:', moduleControllers.map(c => c.name))

@Module({
  providers: [
    ModuleManager,
    ModulesService,
    PrismaService,
    ...moduleProviders,
  ],
  controllers: [ModulesController, ...moduleControllers],
  exports: [ModuleManager, ModulesService],
})
export class PluginSystemModule {
  /**
   * Create a dynamic module that includes loaded module controllers and providers
   */
  static forRoot(): DynamicModule {
    return {
      module: PluginSystemModule,
      providers: [
        ModuleManager,
        ModulesService,
        PrismaService,
        ...moduleProviders,
      ],
      controllers: [ModulesController, ...moduleControllers],
      exports: [ModuleManager, ModulesService],
    }
  }

  /**
   * Create a dynamic module that includes loaded module controllers and providers
   */
  static forFeature(controllers: any[] = [], providers: any[] = []): DynamicModule {
    return {
      module: PluginSystemModule,
      controllers: [ModulesController, ...moduleControllers, ...controllers.filter(Boolean)],
      providers: [
        ModuleManager,
        ModulesService,
        PrismaService,
        ...moduleProviders,
        ...providers.filter(Boolean),
      ],
      exports: [ModuleManager, ModulesService],
    }
  }
}

