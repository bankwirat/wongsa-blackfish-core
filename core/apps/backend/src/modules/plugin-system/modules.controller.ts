import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ModulesService } from './modules.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'

@ApiTags('Modules')
@Controller('modules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully' })
  findAll() {
    return this.modulesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id)
  }

  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable a module' })
  @ApiResponse({ status: 200, description: 'Module enabled successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  enable(@Param('id') id: string) {
    return this.modulesService.enable(id)
  }

  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable a module' })
  @ApiResponse({ status: 200, description: 'Module disabled successfully' })
  @ApiResponse({ status: 404, description: 'Module not found' })
  disable(@Param('id') id: string) {
    return this.modulesService.disable(id)
  }
}

