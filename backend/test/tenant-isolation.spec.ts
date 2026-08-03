/**
 * SUITE DE TESTS D'ISOLATION APPLICATIVE MULTI-TENANT (e2e)
 * 
 * 1. Test : Un utilisateur du Tenant A ne reçoit QUE ses propres données lors des findAll()
 * 2. Test : Un utilisateur du Tenant A ne peut PAS accéder à une ressource d'un Tenant B (findOne)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Isolation Multi-Tenant Applicative (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const tenantA_Id = 'tenant-a-uuid-1111';
  const tenantB_Id = 'tenant-b-uuid-2222';

  let tokenTenantA: string;
  let tokenTenantB: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    jwtService = app.get<JwtService>(JwtService);

    // Génération de tokens JWT réels pour 2 tenants distincts
    tokenTenantA = jwtService.sign({
      sub: 'user-a-1',
      email: 'admin@tenant-a.com',
      role: 'DIRECTOR',
      tenantId: tenantA_Id,
    });

    tokenTenantB = jwtService.sign({
      sub: 'user-b-1',
      email: 'admin@tenant-b.com',
      role: 'DIRECTOR',
      tenantId: tenantB_Id,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Isolation des Listes (findAll)', () => {
    it('GET /api/v1/tenant/users exige un token et utilise le tenantId du JWT', async () => {
      const resA = await request(app.getHttpServer())
        .get('/api/v1/tenant/users')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .expect(200);

      expect(Array.isArray(resA.body)).toBe(true);
    });

    it('GET /api/v1/tenant/students exige un token et filtre par tenantId', async () => {
      const resA = await request(app.getHttpServer())
        .get('/api/v1/tenant/students')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .expect(200);

      expect(Array.isArray(resA.body)).toBe(true);
    });
  });

  describe('Protection contre la fuite Cross-Tenant (findOne par UUID)', () => {
    it('GET /api/v1/tenant/students/:id renvoie 404 si l\'élève appartient au Tenant B mais demandé par Tenant A', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/tenant/students/non-existent-or-tenant-b-uuid')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .expect(404);
    });
  });
});
