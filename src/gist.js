const https = require('https');

class Gist {
  constructor(token, id) {
    this.token = token;
    this.id    = id;
  }

  async get() {
    return this._request('GET', `/gists/${this.id}`);
  }

  async update(data = {}) {
    return this._request('PATCH', `/gists/${this.id}`, data);
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

  async _request(method, path, body = undefined) {
    const data = body ? JSON.stringify(body) : undefined;

    const options = {
      method,
      headers: {
        'Authorization':        `Bearer ${this.token}`,
        'Accept':               'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data && {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        })
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(`https://api.github.com${path}`, options, (res) => {
        let responseData = '';

        res.on('data', chunk => responseData += chunk);

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch (error) {
              reject(new Error(`Error parsing JSON response: ${error.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);

      if (data) req.write(data);
      req.end();
    });
  }
}

module.exports = Gist;
