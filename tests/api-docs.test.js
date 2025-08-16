// tests/api-docs.test.js
import request from 'supertest';
import app from '#server/server.js';

describe('Swagger UI', () => {
  it('should serve swagger.json with correct spec', async () => {
    const res = await request(app).get('/api-docs/swagger.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe('School ERP Backend');
    expect(res.body.servers).toContainEqual({
      url: expect.stringContaining('/api/v1'),
      description: expect.any(String)
    });
  });

  it('should serve Swagger UI with correct initializer', async () => {
    const res = await request(app).get('/api-docs/swagger-initializer.js');
    expect(res.status).toBe(200);
    expect(res.text).toContain("url: '/api-docs/swagger.json'");
    expect(res.text).not.toContain('petstore.swagger.io');
  });

  it('should serve Swagger UI page', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});