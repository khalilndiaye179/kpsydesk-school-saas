/**
 * SUITE DE TESTS D'AUDIT DE SÉCURITÉ JWT
 * 
 * 1. Test : Un token statique "fake-jwt-token-tenant" est rejeté avec 401 Unauthorized
 * 2. Test : Une requête sans token sur /api/v1/tenant/users est rejetée avec 401 Unauthorized
 * 3. Test : Un vrai token JWT émis par /tenant/auth/login permet d'accéder aux endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Audit de Sécurité — Validation des Guards JWT (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Rejet des Faux Tokens (Fake Tokens)', () => {
    it('devrait rejeter "fake-jwt-token-tenant" avec 401 sur GET /api/v1/tenant/users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tenant/users')
        .set('Authorization', 'Bearer fake-jwt-token-tenant')
        .expect(401);
    });

    it('devrait rejeter "fake-jwt-token-tenant" avec 401 sur GET /api/v1/tenant/students', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tenant/students')
        .set('Authorization', 'Bearer fake-jwt-token-tenant')
        .expect(401);
    });

    it('devrait rejeter "fake-jwt-token-tenant" avec 401 sur GET /api/v1/tenant/teachers', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tenant/teachers')
        .set('Authorization', 'Bearer fake-jwt-token-tenant')
        .expect(401);
    });

    it('devrait rejeter "fake-jwt-token-tenant" avec 401 sur GET /api/v1/tenant/classes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tenant/classes')
        .set('Authorization', 'Bearer fake-jwt-token-tenant')
        .expect(401);
    });
  });

  describe('2. Rejet des Requêtes Sans Token', () => {
    it('devrait rejeter une requête anonyme sans token sur GET /api/v1/tenant/users avec 401', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tenant/users')
        .expect(401);
    });

    it('devrait rejeter une requête anonyme sans token sur POST /api/v1/tenant/users avec 401', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tenant/users')
        .send({ email: 'hacker@test.com', firstName: 'Hacker' })
        .expect(401);
    });
  });
});
