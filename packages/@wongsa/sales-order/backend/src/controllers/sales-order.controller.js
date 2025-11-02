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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../../../core/apps/backend/src/auth/guards/jwt-auth.guard");
const sales_order_service_1 = require("../services/sales-order.service");
let SalesOrderController = class SalesOrderController {
    constructor(salesOrderService) {
        this.salesOrderService = salesOrderService;
    }
    findAll(req, workspaceId) {
        return this.salesOrderService.findAll(workspaceId);
    }
    findOne(id) {
        return this.salesOrderService.findOne(id);
    }
    create(createOrderDto, req) {
        if (!createOrderDto.workspaceId) {
            throw new Error('workspaceId is required');
        }
        return this.salesOrderService.create(createOrderDto);
    }
    update(id, updateOrderDto) {
        return this.salesOrderService.update(id, updateOrderDto);
    }
    remove(id) {
        return this.salesOrderService.delete(id);
    }
};
exports.SalesOrderController = SalesOrderController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sales orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales orders retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('workspaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SalesOrderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales order by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales order retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sales order not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesOrderController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new sales order' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sales order created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SalesOrderController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sales order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales order updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesOrderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete sales order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sales order deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesOrderController.prototype, "remove", null);
exports.SalesOrderController = SalesOrderController = __decorate([
    (0, swagger_1.ApiTags)('Sales Orders'),
    (0, common_1.Controller)('sales/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [sales_order_service_1.SalesOrderService])
], SalesOrderController);
//# sourceMappingURL=sales-order.controller.js.map