const Promise = require("bluebird");

class BaseManager {

  constructor(api) {
    this.api = api;
  }

  columns() {
    if (this.api.isSystemAdmin() && this._admin_colums) {
      return [...this._columns, ...this._admin_columns];
    }else {
      return this._columns;
    }
  }

  versioned_url(url) {
    if (this._version) {
      let offset = 0;
      while (url[offset] === '/') {
        offset += 1;
      }
      return '/' + this._version + '/' + url.substr(offset);
    }else {
      return url;
    }
  }

  jsonRequest(method, url, headers, body) {
    return this.api.jsonRequest(this.service_type, this.endpoint_type,
                                method, this.versioned_url(url), headers, body)
  }

  _get(url, response_key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.jsonRequest('GET', url, null, null)
      .then((data) => {
        let result = data.data
        resolve(result[response_key]);
      })
      .catch(reject);
    });
  }

  _list(url, response_key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.jsonRequest('GET', url, null, null)
        .then((data) => {
          let body = data.data
          let total = 0;
          let limit = 0;
          let offset = 0;
          if (body.total) {
            total = body.total;
            if (body.limit) {
              limit = body.limit;
            }
            if (body.offset) {
              offset = body.offset;
            }
          }
          resolve({data: body[response_key], total: total, limit: limit, offset: offset});
        })
        .catch(reject);
    });
  }

  _post(url, body, response_key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.jsonRequest('POST', url, null, body)
      .then((data) => {
        let res = data.data
        resolve(res[response_key]);
      })
      .catch(reject);
    });
  }

  _delete(url, response_key, body) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.jsonRequest('DELETE', url, null, body)
        .then((data) => {
          let res = data.data
          if (res && res[response_key]) {
            resolve(res[response_key]);
          }else {
            resolve();
          }
        })
        .catch(reject);
    });
  }

  _update(url, body, response_key) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.jsonRequest('PUT', url, null, body)
        .then((data) => {
          let res = data.data
          if (res && res[response_key]) {
            resolve(res[response_key]);
          }
        })
        .catch(reject);
    });
  }

}

BaseManager.prototype.service_type = null;
BaseManager.prototype.endpoint_type = null;
BaseManager.prototype._version = null;
BaseManager.prototype._columns = null;
BaseManager.prototype._admin_colums = null;


module.exports = BaseManager;
