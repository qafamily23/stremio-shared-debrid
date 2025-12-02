const Gist = require('../src/gist');

// Mock the @octokit/core module
jest.mock('@octokit/core', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: jest.fn()
  }))
}));

const { Octokit } = require('@octokit/core');

describe('Gist Class', () => {
  const mockToken = 'test-token';
  const mockId = 'test-gist-id';
  let gist;

  beforeEach(() => {
    jest.clearAllMocks();
    gist = new Gist(mockToken, mockId);
  });

  describe('Constructor', () => {
    it('should initialize with token, id, and Octokit instance', () => {
      expect(gist.id).toBe(mockId);
      expect(gist.octokit).toBeDefined();
      expect(Octokit).toHaveBeenCalledWith({
        auth: mockToken
      });
    });
  });

  describe('get method', () => {
    it('should call request method with GET gist endpoint', async () => {
      const mockResponseData = {
        id: mockId,
        files: { 'test.txt': { content: 'test content' } }
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponseData);

      const result = await gist.get();

      expect(gist.request).toHaveBeenCalledWith('GET /gists/{gist_id}');
      expect(result).toEqual(mockResponseData);
    });

    it('should handle request method errors', async () => {
      const errorMessage = 'Gist not found';
      jest.spyOn(gist, 'request').mockRejectedValue(new Error(errorMessage));

      await expect(gist.get()).rejects.toThrow(errorMessage);
    });
  });

  describe('update method', () => {
    it('should call request method with PATCH gist endpoint and provided data', async () => {
      const mockResponseData = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'request').mockResolvedValue(mockResponseData);

      const updateData = {
        description: 'Updated description',
        files: {
          'test.txt': { content: 'updated content' }
        }
      };

      const result = await gist.update(updateData);

      expect(gist.request).toHaveBeenCalledWith('PATCH /gists/{gist_id}', updateData);
      expect(result).toEqual(mockResponseData);
    });

    it('should handle request method errors', async () => {
      const errorMessage = 'Update failed';
      jest.spyOn(gist, 'request').mockRejectedValue(new Error(errorMessage));

      const updateData = { files: { 'test.txt': { content: 'content' } } };

      await expect(gist.update(updateData)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateContent method', () => {
    it('should call update method with single file content', async () => {
      const mockResponseData = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'update').mockResolvedValue(mockResponseData);

      const result = await gist.updateContent('test.txt', 'new content');

      expect(gist.update).toHaveBeenCalledWith({
        files: {
          'test.txt': { content: 'new content' }
        }
      });
      expect(result).toEqual(mockResponseData);
    });

    it('should handle different types of content by converting to string', async () => {
      const mockResponseData = {
        id: mockId,
        updated: true
      };

      jest.spyOn(gist, 'update').mockResolvedValue(mockResponseData);

      await gist.updateContent('number.txt', 123);
      await gist.updateContent('boolean.txt', true);
      await gist.updateContent('object.txt', { key: 'value' });

      expect(gist.update).toHaveBeenNthCalledWith(1, {
        files: {
          'number.txt': { content: 123 }
        }
      });
      expect(gist.update).toHaveBeenNthCalledWith(2, {
        files: {
          'boolean.txt': { content: true }
        }
      });
      expect(gist.update).toHaveBeenNthCalledWith(3, {
        files: {
          'object.txt': { content: { key: 'value' } }
        }
      });
    });

    it('should handle update method errors', async () => {
      const errorMessage = 'Update content failed';
      jest.spyOn(gist, 'update').mockRejectedValue(new Error(errorMessage));

      await expect(gist.updateContent('test.txt', 'content')).rejects.toThrow(errorMessage);
    });
  });

  describe('getContent method', () => {
    it('should return content of a specific file from the gist', async () => {
      const mockGistData = {
        id: mockId,
        files: {
          'test.txt': { content: 'test content' },
          'config.json': { content: '{"key": "value"}' }
        }
      };

      jest.spyOn(gist, 'get').mockResolvedValue(mockGistData);

      const result = await gist.getContent('test.txt');

      expect(gist.get).toHaveBeenCalled();
      expect(result).toBe('test content');
    });

    it('should handle different file types correctly', async () => {
      const mockGistData = {
        id: mockId,
        files: {
          'script.js': { content: 'console.log("hello");' },
          'data.json': { content: '{"name": "test"}' }
        }
      };

      jest.spyOn(gist, 'get').mockResolvedValue(mockGistData);

      const jsContent = await gist.getContent('script.js');
      const jsonContent = await gist.getContent('data.json');

      expect(jsContent).toBe('console.log("hello");');
      expect(jsonContent).toBe('{"name": "test"}');
    });

    it('should return empty string when file is not found in gist', async () => {
      const mockGistData = {
        id: mockId,
        files: {
          'existing.txt': { content: 'content' }
        }
      };

      jest.spyOn(gist, 'get').mockResolvedValue(mockGistData);

      const result = await gist.getContent('nonexistent.txt');

      expect(result).toBe('');
    });

    it('should return empty string when gist has no files', async () => {
      const mockGistData = {
        id: mockId,
        files: {}
      };

      jest.spyOn(gist, 'get').mockResolvedValue(mockGistData);

      const result = await gist.getContent('anyfile.txt');

      expect(result).toBe('');
    });

    it('should handle get method errors', async () => {
      const errorMessage = 'Failed to fetch gist';
      jest.spyOn(gist, 'get').mockRejectedValue(new Error(errorMessage));

      await expect(gist.getContent('test.txt')).rejects.toThrow(errorMessage);
    });
  });
});
