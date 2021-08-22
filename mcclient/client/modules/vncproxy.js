const BaseManager = require('../manager/base')

class VNCProxyManager extends BaseManager {

  connect(idstr, params) {
    let url = '/vncproxy';
    if (params && params.objtype) {
      url += '/' + params.objtype
    }
    url += '/' + idstr
    return this._post(url, null, 'vncproxy')
  }

}

VNCProxyManager.prototype.service_type = 'vncproxy';

module.exports = VNCProxyManager
