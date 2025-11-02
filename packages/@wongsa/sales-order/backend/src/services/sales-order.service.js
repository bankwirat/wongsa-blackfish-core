"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/apps/backend/src/prisma/prisma.service");
let SalesOrderService = class SalesOrderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(workspaceId) {
        const where = workspaceId ? { workspaceId } : {};
        return this.prisma.salesOrder.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.salesOrder.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Sales order with ID ${id} not found`);
        }
        return order;
    }
    async findByWorkspace(workspaceId) {
        return this.prisma.salesOrder.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(orderData) {
        return this.prisma.salesOrder.create({
            data: {
                orderNumber: orderData.orderNumber,
                customer: orderData.customer,
                amount: orderData.amount,
                status: orderData.status || 'pending',
                date: orderData.date || new Date(),
                workspaceId: orderData.workspaceId,
            },
        });
    }
    async update(id, orderData) {
        await this.findOne(id);
        return this.prisma.salesOrder.update({
            where: { id },
            data: orderData,
        });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.salesOrder.delete({
            where: { id },
        });
        return true;
    }
};
exports.SalesOrderService = SalesOrderService;
exports.SalesOrderService = SalesOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesOrderService);
//# sourceMappingURL=sales-order.service.js.map