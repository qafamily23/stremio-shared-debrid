const request = require('supertest');
const app = require('../src/app');

describe('Express Server', () => {
  describe('manifest Route', () => {
    it('should return manifest data for valid route', async () => {
      const response = await request(app)
        .get('/test-token/ls12345/testuser/manifest.json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(response.body).toHaveProperty('id', 'com.github.anhkind');
      expect(response.body).toHaveProperty('name', 'Shared Debrid Notifier');
      expect(response.body).toHaveProperty('resources', ['stream']);
      expect(response.body).toHaveProperty('types', ['movie', 'series', 'channel', 'tv']);
    });

    it('should handle different auth tokens and gist IDs', async () => {
      const response = await request(app)
        .get('/another-token/different-gist/anotheruser/manifest.json')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'com.github.anhkind');
    });

    it('should return 404 for non-manifest routes', async () => {
      await request(app)
        .get('/test-token/ls12345/testuser/wrong-route.json')
        .expect(404);
    });
  });
});
