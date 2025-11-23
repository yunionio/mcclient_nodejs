const Promise = require("bluebird");
const querystring = require('querystring');
const BaseManager = require('./base');


class StandaloneManager extends BaseManager {
  keyword() {
    return this._keyword;
  }

  keyword_plural() {
    return this._keyword_plural;
  }

  get(idstr, params) {
    let url = '/' + this.keyword_plural() + '/' + idstr;
    if (params) {
      url += '?' + querystring.stringify(params);
    }
    return this._get(url, this.keyword());
  }

  getSpecific(idstr, spec, params) {
    let url = '/' + this.keyword_plural() + '/' + idstr + '/' + spec;
    if (params) {
      url += '?' + querystring.stringify(params);
    }
    return this._get(url, this.keyword());
  }

  list(params) {
    let url = '/' + this.keyword_plural();
    if (params) {
      url += '?' + querystring.stringify(params);
    }
    return this._list(url, this.keyword_plural());
  }

  create(params) {
    let body = {}
    body[this.keyword()] = params
    let url = '/' + this.keyword_plural()
    return this._post(url, body, this.keyword())
  }

  update(idstr, params) {
    let url = '/' + this.keyword_plural();
    if (idstr) {
      url += '/' + idstr
    }
    let body = {}
    body[this.keyword()] = params
    return this._update(url, body, this.keyword())
  }

  batchUpdate(idlist, params) {
    let self = this;
    let res = []
    return new Promise(function (resolve, reject) {
      Promise.map(idlist, function (idstr)  {
        return self.update(idstr, params)
                .then(function (result) {
                  res.push({status: 200, id: idstr, data: result});
                })
                .catch(function (err) {
                  err = JSON.parse(err)
                  res.push({status: err.code, id: idstr, reason: err.details});
                });
        }).then(function () {
          resolve(res);
        }).catch(function (err) {
          console.error(err);
          reject(err);
        });
    });
  }

  performAction(idstr, action, params) {
    let url = '/' + this.keyword_plural() + '/' + idstr + '/' + action
    let body = {}
    body[this.keyword()] = params
    return this._post(url, body, this.keyword())
  }

  batchPerformAction(idlist, action, params) {
    let self = this;
    let res = []
    return new Promise((resolve, reject) => {
      Promise.map(idlist, (idstr) => {
        return self.performAction(idstr, action, params)
                .then((result) => {
                  res.push({status: 200, id: idstr, data: result});
                })
                .catch((err) => {
                  err = JSON.parse(err)
                  res.push({status: err.code, id: idstr, reason: err.details});
                })
        }).then(() => {
          resolve(res);
        }).catch((err) => {
          console.error(err);
          reject(err);
        });
      });
  }

  delete(idstr) {
    let url = '/' + this.keyword_plural() + '/' + idstr
    return this._delete(url, this.keyword(), null)
  }

  batchDelete(idlist) {
    let self = this;
    let res = [];
    return new Promise(function (resolve, reject) {
      Promise.map(idlist, function(idstr) {
          return self.delete(idstr)
            .then(function (result) {
              res.push({status: 200, id: idstr, data: result});
            })
            .catch(function (err) {
              err = JSON.parse(err);
              res.push({status: err.code, id: idstr, reason: err.details});
            });
        }).then(function () {
          resolve(res);
        }).catch(function (err) {
          console.error(err);
          reject(err);
        });
      });
  }
}

StandaloneManager.prototype._keyword = null;
StandaloneManager.prototype._keyword_plural = null;


module.exports = StandaloneManager;
