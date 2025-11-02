import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../../../core/apps/backend/src/prisma/prisma.service'
import { Prisma } from '@prisma/client'

export type SalesOrderStatus = 'pending' | 'processing' | 'completed'

export interface CreateSalesOrderDto {
  orderNumber: string
  customer: string
  amount: number | Prisma.Decimal
  status?: SalesOrderStatus
  date?: Date
  workspaceId: string
}

export interface UpdateSalesOrderDto {
  orderNumber?: string
  customer?: string
  amount?: number | Prisma.Decimal
  status?: SalesOrderStatus
  date?: Date
}

@Injectable()
export class SalesOrderService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId?: string) {
    const where = workspaceId ? { workspaceId } : {}
    return this.prisma.salesOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
    })
    if (!order) {
      throw new NotFoundException(`Sales order with ID ${id} not found`)
    }
    return order
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.salesOrder.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(orderData: CreateSalesOrderDto) {
    return this.prisma.salesOrder.create({
      data: {
        orderNumber: orderData.orderNumber,
        customer: orderData.customer,
        amount: orderData.amount,
        status: orderData.status || 'pending',
        date: orderData.date || new Date(),
        workspaceId: orderData.workspaceId,
      },
    })
  }

  async update(id: string, orderData: UpdateSalesOrderDto) {
    // Check if order exists
    await this.findOne(id)
    
    return this.prisma.salesOrder.update({
      where: { id },
      data: orderData,
    })
  }

  async delete(id: string) {
    // Check if order exists
    await this.findOne(id)
    
    await this.prisma.salesOrder.delete({
      where: { id },
    })
    return true
  }
}

