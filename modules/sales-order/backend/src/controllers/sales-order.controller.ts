import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../../../../core/apps/backend/src/auth/guards/jwt-auth.guard'
import { SalesOrderService, CreateSalesOrderDto, UpdateSalesOrderDto } from '../services/sales-order.service'

interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
}

@ApiTags('Sales Orders')
@Controller('sales/orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sales orders' })
  @ApiResponse({ status: 200, description: 'Sales orders retrieved successfully' })
  findAll(@Request() req: AuthenticatedRequest, @Query('workspaceId') workspaceId?: string) {
    // Filter by workspace if provided, otherwise get all for the user
    return this.salesOrderService.findAll(workspaceId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiResponse({ status: 200, description: 'Sales order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Sales order not found' })
  findOne(@Param('id') id: string) {
    return this.salesOrderService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sales order' })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  create(@Body() createOrderDto: CreateSalesOrderDto, @Request() req: AuthenticatedRequest) {
    // Ensure workspaceId is set
    if (!createOrderDto.workspaceId) {
      throw new Error('workspaceId is required')
    }
    return this.salesOrderService.create(createOrderDto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sales order' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateSalesOrderDto) {
    return this.salesOrderService.update(id, updateOrderDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sales order' })
  @ApiResponse({ status: 200, description: 'Sales order deleted successfully' })
  remove(@Param('id') id: string) {
    return this.salesOrderService.delete(id)
  }
}

