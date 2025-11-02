import { SalesOrderService, CreateSalesOrderDto, UpdateSalesOrderDto } from '../services/sales-order.service';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    };
}
export declare class SalesOrderController {
    private readonly salesOrderService;
    constructor(salesOrderService: SalesOrderService);
    findAll(req: AuthenticatedRequest, workspaceId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: import("node_modules/@prisma/client/runtime/library").Decimal;
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
        amount: import("node_modules/@prisma/client/runtime/library").Decimal;
        status: string;
        date: Date;
    }>;
    create(createOrderDto: CreateSalesOrderDto, req: AuthenticatedRequest): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: import("node_modules/@prisma/client/runtime/library").Decimal;
        status: string;
        date: Date;
    }>;
    update(id: string, updateOrderDto: UpdateSalesOrderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        orderNumber: string;
        customer: string;
        amount: import("node_modules/@prisma/client/runtime/library").Decimal;
        status: string;
        date: Date;
    }>;
    remove(id: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=sales-order.controller.d.ts.map