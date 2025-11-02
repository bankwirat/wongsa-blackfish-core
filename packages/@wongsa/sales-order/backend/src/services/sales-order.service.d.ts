import { PrismaService } from '../../../../../../core/apps/backend/src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
export type SalesOrderStatus = 'pending' | 'processing' | 'completed';
export interface CreateSalesOrderDto {
    orderNumber: string;
    customer: string;
    amount: number | Prisma.Decimal;
    status?: SalesOrderStatus;
    date?: Date;
    workspaceId: string;
}
export interface UpdateSalesOrderDto {
    orderNumber?: string;
    customer?: string;
    amount?: number | Prisma.Decimal;
    status?: SalesOrderStatus;
    date?: Date;
}
export declare class SalesOrderService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: Prisma.Decimal;
        status: string;
        date: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: Prisma.Decimal;
        status: string;
        date: Date;
    }>;
    findByWorkspace(workspaceId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: Prisma.Decimal;
        status: string;
        date: Date;
    }[]>;
    create(orderData: CreateSalesOrderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: Prisma.Decimal;
        status: string;
        date: Date;
    }>;
    update(id: string, orderData: UpdateSalesOrderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: Prisma.Decimal;
        status: string;
        date: Date;
    }>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=sales-order.service.d.ts.map