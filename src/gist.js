const { Octokit } = require('@octokit/core');

class Gist {
  constructor(token, id) {
    this.id = id;
    this.octokit = new Octokit({
      auth: token
    });
  }

  async request(route, data = {}) {
    try {
      const response = await this.octokit.request(
        route,
        {
          gist_id: this.id,
          headers: { 'X-GitHub-Api-Version': '2022-11-28' },
          ...data,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to request: ${error.message}`);
    }
  }

  async get() {
    return this.request('GET /gists/{gist_id}');
  }

  async update(data = {}) {
    return this.request('PATCH /gists/{gist_id}', data);
  }

  async getContent(fileName) {
    const gist = await this.get();
    return gist.files && gist.files[fileName] ? gist.files[fileName].content : '';
  }

  async updateContent(fileName, content) {
    return this.update({
      files: {
        [fileName]: { content }
      }
    });
  }
}

module.exports = Gist;
