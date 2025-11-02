import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PluginSystemModule } from './modules/plugin-system/plugin-system.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModulesService } from './modules/plugin-system/modules.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    PluginSystemModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  /**
   * Create a dynamic module that includes loaded module controllers
   * This is called after modules are loaded in ModulesService.onModuleInit
   */
  static forRootAsync(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
        PrismaModule,
        AuthModule,
        UsersModule,
        WorkspacesModule,
        PluginSystemModule.forRoot(),
      ],
      controllers: [AppController],
      providers: [AppService],
    }
  }

  /**
   * Dynamically add module controllers to the app module
   * This method will be called after modules are loaded
   */
  static withModuleControllers(controllers: any[], providers: any[]): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
        PrismaModule,
        AuthModule,
        UsersModule,
        WorkspacesModule,
        PluginSystemModule.forFeature(controllers, providers),
      ],
      controllers: [AppController, ...controllers],
      providers: [AppService, ...providers],
    }
  }
}
