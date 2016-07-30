import rp from 'request-promise';
import DataLoader from 'dataloader';

// Keys are GitHub API URLs, values are { etag, result } objects
const eTagCache = {};

const GOOGLE_API_ROOT = 'https://maps.googleapis.com/';

export class GoogleConnector {
  constructor({ apiKey } = {}) {
    this.apiKey = apiKey;

    // Allow mocking request promise for tests
    this.rp = rp;
    if (GoogleConnector.mockRequestPromise) {
      this.rp = GoogleConnector.mockRequestPromise;
    }

    this.loader = new DataLoader(this.fetch.bind(this), {
      // The GitHub API doesn't have batching, so we should send requests as
      // soon as we know about them
      batch: false,
    });
  }
  fetch(urls) {
    const options = {
      json: true,
      resolveWithFullResponse: true,
      headers: {
        'user-agent': 'GitHunt',
      },
    };

    if (this.apiKey) {
      options.qs = {
        apiKey: this.apiKey
      };
    }

    // TODO: pass GitHub API key

    return Promise.all(urls.map((url) => {
      const cachedRes = eTagCache[url];

      if (cachedRes && cachedRes.eTag) {
        options.headers['If-None-Match'] = cachedRes.eTag;
      }
      return new Promise((resolve) => {
        this.rp({
          uri: url,
          ...options,
        }).then((response) => {
          const body = response.body;
          eTagCache[url] = {
            result: body,
            eTag: response.headers.etag,
          };
          console.log(body);

          console.log('gonzalo');
          resolve(body);
        }).catch((err) => {
          if (err.statusCode === 304) {
            resolve(cachedRes.result);
          }
        });
      });
    }));
  }
  get(path) {
    console.log(GOOGLE_API_ROOT + path + `&key=${this.apiKey}`);
    return this.loader.load(GOOGLE_API_ROOT + path + `&key=${this.apiKey}`);
  }
}
