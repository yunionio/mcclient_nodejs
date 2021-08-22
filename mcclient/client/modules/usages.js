const Promise = require('bluebird');
const ComputeManager = require("../manager/compute");

class UsageManager extends ComputeManager {

  getGeneralUsage() {
    let self = this
    return new Promise(function(resolve, reject) {
      let url = '/usages'
      self._get(url, self.keyword())
        .then(function(result) {
          resolve(result);
        })
        .catch(reject);
    });
  }

}

UsageManager.prototype._keyword = 'usage';
UsageManager.prototype._keyword_plural = 'usages';

module.exports = UsageManager;
