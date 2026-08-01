"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_auth_controller_1 = require("./auth/tenant-auth.controller");
const tenant_auth_service_1 = require("./auth/tenant-auth.service");
const tenant_classes_controller_1 = require("./classes/tenant-classes.controller");
const tenant_classes_service_1 = require("./classes/tenant-classes.service");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'kpsydesk_jwt_super_secret_key_change_me_in_production',
                signOptions: { expiresIn: '1d' },
            }),
        ],
        controllers: [tenant_auth_controller_1.TenantAuthController, tenant_classes_controller_1.TenantClassesController],
        providers: [tenant_auth_service_1.TenantAuthService, tenant_classes_service_1.TenantClassesService, prisma_service_1.PrismaService],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map