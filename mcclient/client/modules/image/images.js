const querystring = require("querystring");
const GlanceManager = require("../../manager/image");
const error = require('../../../error');

const _meta_prefix = 'x-image-meta';
const _meta_property_prefix = 'x-image-meta-property';

function getMeta(headers) {
  let meta = {};
  meta['properties'] = {};
  for (let k in headers) {
    let v = decodeURI(headers[k]);
    if (k.startsWith(_meta_property_prefix)) {
      let kn = k.substr(_meta_property_prefix.length + 1);
      meta['properties'][kn] = v;
    } else if (k.startsWith(_meta_prefix)) {
      kn = k.substr(_meta_prefix.length + 1);
      meta[kn] = v;
    }
  }
  return meta
}

class ImageManager extends GlanceManager {

  list(params) {
    let url = '/images/detail';
    let query = querystring.stringify(params);
    if (query) {
      url += '?' + query;
    }
    return this._list(url, this.keyword_plural());
  }

  getById(idstr, params) {
    let url = '/images/' + idstr;
    if (!params) {
      let qs = querystring.stringify(params);
      if (qs) {
        url += '?' + qs
      }
    }
    let self = this;
    return new Promise(function(resolve, reject) {
      self.jsonRequest('HEAD', url, null, null)
        .then(function(result) {
          resolve(getMeta(result));
        })
        .catch(function(err) {
          reject(err);
        });
      });
  }

  getByName(name, params) {
    let self = this;
    if (!params) {
      params = {};
    }
    params.name = name;
    return new Promise(function(resolve, reject) {
      self.list(params)
        .then(function(result) {
          if (result.data) {
            let ret = null
            for (let i = 0; i < result.data.length; i++) {
              if (result.data[i].name === name) {
                if (!ret) {
                  ret = result.data[i];
                } else {
                  reject(new error.ConflictError('Multiple images with name ' + name));
                  return;
                }
              }
            }
            if (ret) {
              resolve(ret);
            } else {
              reject(new error.NotFoundError('Image ' + name + ' not found'));
              return;
            }
          }
        })
        .catch(reject);
      })
  }

  get(idstr, params) {
    let self = this
    return new Promise(function(resolve, reject) {
      self.getById(idstr)
        .then(function(result) {
          resolve(result);
        })
        .catch(function(err) {
          self.getByName(idstr)
            .then(function(result) {
              resolve(result);
            })
            .catch(function(err) {
              reject(err);
            });
      });
    });
  }

}

ImageManager.prototype._keyword = 'image';
ImageManager.prototype._keyword_plural = 'images';
ImageManager.prototype._columns = ['ID', 'Name', 'Tags', 'Disk_format',
                                    'Size', 'Is_public', 'OS_Type',
                                    'OS_Distribution', 'OS_version',
                                    'Min_disk', 'Min_ram', 'Status',
                                    'Notes', 'OS_arch', 'Preference',
                                    'OS_Codename', 'Parent_id'];
ImageManager.prototype._admin_columns = ['Owner', 'Owner_name'];

module.exports = ImageManager;
