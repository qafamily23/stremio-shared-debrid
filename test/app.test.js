const request = require('supertest');
const app = require('../src/app');
const Gist = require('../src/gist');

// Mock @octokit/core to prevent actual API calls
jest.mock('@octokit/core', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

jest.mock('../src/gist');

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

  describe('Stream Route', () => {
    let mockGist;

    beforeEach(() => {
      mockGist = {
        getContent: jest.fn()
      };
      Gist.mockImplementation(() => mockGist);
    });

    it('should return gist content for valid parameters', async () => {
      const mockContent = { some: 'data', content: 'example' };
      mockGist.getContent.mockResolvedValue(mockContent);

      const response = await request(app)
        .get('/test-token/abc123/testuser/stream/movie/123.json')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');

      expect(Gist).toHaveBeenCalledWith('test-token', 'abc123');
      expect(mockGist.getContent).toHaveBeenCalled();
      expect(response.body).toEqual(mockContent);
    });

    it('should handle different types and IDs', async () => {
      const mockContent = { streams: ['stream1', 'stream2'] };
      mockGist.getContent.mockResolvedValue(mockContent);

      const response = await request(app)
        .get('/valid-token/def456/anotheruser/stream/series/456.json')
        .expect(200);

      expect(Gist).toHaveBeenCalledWith('valid-token', 'def456');
      expect(response.body).toEqual(mockContent);
    });

    it('should handle errors when gist retrieval fails', async () => {
      const errorMessage = 'Gist not found';
      mockGist.getContent.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .get('/invalid-token/badgist/user/stream/movie/789.json')
        .expect(500);

      expect(Gist).toHaveBeenCalledWith('invalid-token', 'badgist');
      expect(response.body).toEqual({
        error: 'Failed to fetch gist',
        message: errorMessage
      });
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Bad credentials');
      mockGist.getContent.mockRejectedValue(authError);

      const response = await request(app)
        .get('/bad-token/validgist/user/stream/channel/999.json')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch gist');
      expect(response.body.message).toBe('Bad credentials');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockGist.getContent.mockRejectedValue(networkError);

      const response = await request(app)
        .get('/token/gistid/user/stream/tv/111.json')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch gist');
      expect(response.body.message).toBe('Network timeout');
    });

    it('should return empty string when gist has no content', async () => {
      mockGist.getContent.mockResolvedValue('');

      const response = await request(app)
        .get('/token/emptygist/user/stream/movie/222.json')
        .expect(200);

      expect(response.text).toBe('');
    });

    it('should handle complex JSON content', async () => {
      const complexContent = {
        streams: [
          {
            url: 'https://example.com/stream1',
            quality: '720p',
            format: 'mp4'
          },
          {
            url: 'https://example.com/stream2',
            quality: '1080p',
            format: 'mkv'
          }
        ],
        metadata: {
          title: 'Test Stream',
          duration: 3600
        }
      };
      mockGist.getContent.mockResolvedValue(complexContent);

      const response = await request(app)
        .get('/token/complexgist/user/stream/series/333.json')
        .expect(200);

      expect(response.body).toEqual(complexContent);
    });
  });
});
