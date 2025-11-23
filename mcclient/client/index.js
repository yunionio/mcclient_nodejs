const Promise = require("bluebird");
const misc = require("../misc");
const error = require("../error");

class Client {

  constructor(url, timeout, debug) {
    this.auth_url = url;
    this.timeout = timeout;
    this.debug = debug;

    this.catalog = null;
    const http = require('https');
    const keepAliveAgent = new http.Agent({
      keepAlive: true,
      rejectUnauthorized: false  // Disable SSL certificate verification
    });
    this.agent = keepAliveAgent;

    const SessionManager = require("./session");
    this.sessionman = new SessionManager(this);
    this.initModules();
  }

  initModules() {
    const path = require("path");
    const modules_dir = path.join(__dirname, "modules");
    this.initModulesInDir(modules_dir);
  }

  initModulesInDir(modules_dir) {
    const fs = require("fs");
    const path = require("path");
    let self = this;
    fs.readdir(modules_dir, function(err, files) {
      if (err) {
        throw err;
      }else {
        for(let i = 0; i < files.length; i ++) {
          if (files[i].endsWith(".js")) {
            let module_name = files[i].slice(0, -3);
            if (self.debug) {
              console.log("init module", module_name);
            }
            self[module_name] = require(path.join(modules_dir, module_name));
          } else if (fs.statSync(path.join(modules_dir, files[i])).isDirectory()) {
            self.initModulesInDir(path.join(modules_dir, files[i]));
          }
        }
      }
    });
  }

  request(method, url, headers, body) {
    if (this.debug) {
      console.log(method, url, headers);
    }
    let self = this;
    return new Promise(function(resolve, reject) {
      const urlparser = require('url');
      let urlobj = urlparser.parse(url);
      let transport = null;
      if (urlobj.protocol === 'http:') {
        transport = require('http');
      }else if(urlobj.protocol === 'https:') {
        transport = require('https');
      }else {
        reject('Unsupported protocol ' + urlobj.protocol);
      }
      if (! headers) {
        headers = {};
      }
      headers['User-Agent'] = 'yunioncli/node.js';
      if (method == 'POST' || method == 'PUT') {
        let contlen = body ? body.length: 0;
        headers['Content-Length'] = contlen;
      }
      const options = {
        agent: self.agent,
        timeout: self.timeout,
        method: method,
        protocol: urlobj.protocol,
        hostname: urlobj.hostname,
        port: urlobj.port,
        path: urlobj.path,
        headers: headers,
      };
      let result = '';
      let req = transport.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          result += chunk;
        });
        res.on('end', () => {
          if (method === 'HEAD') {
            result = res.headers
          }
          if (self.debug) {
            console.log('request result: ');
            console.log(res.headers);
            console.log(result);
          }
          if (res.statusCode >= 400) {
            reject(error.clientError(result), res.statusCode);
          } else {
            resolve({data: result, headers: res.headers});
          }
        });
      });
      req.on('error', function(e) {
        reject(error.clientError(e));
      });
      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  jsonRequest(method, url, headers, body) {
    let self = this;
    return new Promise(function(resolve, reject) {
      if (body) {
        body = JSON.stringify(body);
      }
      if (!headers) {
        headers = {};
      }
      headers['Content-Type'] = 'application/json';
      self.request(method, url, headers, body)
        .then(function(data) {
          let result = data.data
          let headers = data.headers
          if (result.constructor.name === 'String') {
            try {
              result = JSON.parse(result);
            }catch(e) {
              console.error('client.jsonRequest JSON decode error: ' + e);
              reject(e);
              return;
            }
          } else {
            console.warn('WARNING: client.jsonRequest result body is already a json object');
          }
          resolve({data: result, headers: headers});
        })
        .catch(reject);
    });
  }

  auth_version() {
    let pos = this.auth_url.lastIndexOf('/')
    if (pos > 0) {
      return this.auth_url.substring(pos+1)
    }else {
      return ''
    }
  }

  auth(uname, passwd, domain, tenant_id, tenant_name, tenant_domain) {
    if (this.auth_version() === 'v3') {
      return this._auth_v3(uname, passwd, domain, tenant_id, tenant_name, tenant_domain, null);
    } else {
      return this._auth_v2(uname, passwd, tenant_id, tenant_name, null);
    }
  }

  set_project(tenant_name, token) {
    if (this.auth_version() === 'v3') {
      return this._auth_v3(null, null, null, null, tenant_name, null, token);
    } else {
      return this._auth_v2(null, null, null, tenant_name, token);
    }
  }

  refresh(tenantId, tenantName, domain, token) { 
    if (this.auth_version() === 'v3') {
      return this._auth_v3(null, null, null, tenantId, tenantName, domain, token);
    } else {
      return this._auth_v2(null, null, tenantId, tenantName, token);
    }
  }

  _auth_v3(uname, passwd, udomain, project_id, project, project_domain, token) {
    let self = this;
    let authinfo = {};
    authinfo.identity = {}
    if (uname && passwd) {
      authinfo.identity.methods = ['password']
      authinfo.identity.password = {}
      authinfo.identity.password.user = {}
      authinfo.identity.password.user.name = uname
      authinfo.identity.password.user.password = passwd
      authinfo.identity.password.user.domain = {}
      if (udomain) {
        authinfo.identity.password.user.domain.name = udomain
      } else {
        authinfo.identity.password.user.domain.id = 'default'
      }
    } else if (token) {
      authinfo.identity.methods = ['token']
      authinfo.identity.token = {}
      authinfo.identity.token.id = token
    }
    authinfo.scope = {}
    if (project_id || project) {
      authinfo.scope.project = {}
      if (project_id) {
        authinfo.scope.project.id = project_id
      }
      if (project) {
        authinfo.scope.project.name = project
        authinfo.scope.project.domain = {}
        if (project_domain) {
          authinfo.scope.project.domain.name = project_domain
        } else {
          authinfo.scope.project.domain.id = 'default'
        }
      }
    }
    return new Promise(function(resolve, reject) {
      self.jsonRequest('POST', self.auth_url + '/auth/tokens', null, {auth: authinfo})
        .then(function(result) {
          let token_str = result.headers['x-subject-token']
          self.catalog = new CatalogV3(result.data.token.catalog);
          const token = new TokenCredentialV3(result.data.token, token_str);
          resolve(token);
        })
        .catch(reject);
    });
  }

  _auth_v2(uname, passwd, tenant_id, tenant_name, token) {
    let self = this;
    let authinfo = {};
    if (uname && passwd) {
      authinfo.passwordCredentials = {username: uname, password: passwd};
    }
    if (tenant_id) {
      authinfo.tenantId = tenant_id;
    }
    if (tenant_name) {
      authinfo.tenantName = tenant_name;
    }
    if (token) {
      authinfo.token = {id: token}
    }
    return new Promise(function(resolve, reject) {
      self.jsonRequest('POST', self.auth_url + '/tokens', null, {auth: authinfo})
        .then(function(body, headers) {
          const token = new TokenCredentialV2(body.access);
          self.catalog = token.getCatalog(); 
          resolve(token);
        })
        .catch(reject);
    });
  }

  session(region, zone, endpoint_type, token, api_version) {
    return new ClientSession(this, region, zone, endpoint_type, token, api_version);
  }

  saveToken(token) {
    return this.sessionman.save(token);
  }

  getToken(tid) {
    return this.sessionman.get(tid);
  }

  removeToken(tid) {
    this.sessionman.remove(tid);
  }
}

class CatalogV3 {
  constructor(catalog) {
    this.catalog = catalog;
  }

  getRegions() {
    let regions = [];
    for(let i = 0; i < this.catalog.length; i ++) {
      let rec = this.catalog[i];
      for(let j = 0; j < rec.endpoints.length; j ++) {
        let region = rec.endpoints[j].region;
        if (regions.indexOf(region) < 0) {
          regions.push(region);
        }
      }
    }
    return regions;
  }

  getServiceEndpoint(service, region, zone, endpoint_type) {
    return random_choices(this.getServiceEndpoints(service, region, zone, endpoint_type));
  }

  getServiceEndpoints(service, region, zone, endpoint_type) {
    if (!endpoint_type) {
      endpoint_type = 'internalURL';
    }
    for (let i = 0; i < this.catalog.length; i ++) {
      if (this.catalog[i].type === service) {
        if (!this.catalog[i].endpoints) {
          continue;
        }
        let selected = [];
        let regeps = {};
        let region_zone = '';
        if (region && zone) {
          region_zone = region + '-' + zone;
        }
        for (let j = 0; j < this.catalog[i].endpoints.length; j ++) {
          let ep = this.catalog[i].endpoints[j];
          if (endpoint_type.indexOf(ep.interface) === 0 && (
            region === ep.region_id ||
            region_zone === ep.region_id ||
            !region
          )) {
            if (!regeps[ep.region_id]) {
              regeps[ep.region_id] = [];
            }
            regeps[ep.region_id].push(ep.url);
          }
        }
        if (!region) {
          if (regeps) {
            for (var k in regeps) {
              selected = regeps[k];
              break;
            }
          } else {
            throw new Error('No default region');
          }
        } else {
          if (region_zone && regeps[region_zone]) {
            selected = regeps[region_zone];
          }else if (regeps[region]) {
            selected = regeps[region];
          }else {
            throw new Error('No valid ' + endpoint_type + ' endpoints for ' + service + ' in region ' + region + '/' + zone);
          }
        }
        return selected;
      }
    }
    throw new Error('No such service ' + service);
  }
}

class TokenCredentialV3 {
  constructor(info, token) {
    this.token = token;
    this.info = info;
    this.catalog = new CatalogV3(info.catalog);
  }

  getCatalog() {
    return this.catalog;
  }

  getToken() {
    return this.token;
  }

  getTenantId() {
    return this.info.project.id
  }

  getProjectId() {
    return this.info.project.id;
  }

  getTenantName() {
    return this.info.project.name;
  }

  getProjectName() {
    return this.info.project.name;
  }

  getProjectDomain() {
    return this.info.project.domain.name;
  }

  getProjectDomainId() {
    return this.info.project.domain.id;
  }

  getProjects() {
    return this.info.projects;
  }

  getProjectNames() {
    return this.info.projects.map(project => project.name);
  }

  getUserId() {
    return this.info.user.id;
  }

  getUserName() {
    return this.info.user.name;
  }

  getUserDomain() {
    return this.info.user.domain.name;
  }

  getUserDomainId() {
    return this.info.user.domain.id;
  }

  getRoles() {
    return this.info.roles;
  }

  getExpires() {
    return new Date(this.info.expires_at);
  }

  isValid() {
    let now = new Date();
    if (this.getExpires() < now) {
      return false;
    }else {
      return true;
    }
  }

  validSeconds() {
    let now = new Date();
    return Math.floor((this.getExpires().getTime() - now.getTime())/1000);
  }

  getRegions() {
    return this.catalog.getRegions()
  }

  isSystemAdmin() {
    let roles = this.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'admin') {
        return true
      }
    }
    return false
  }
}

function random_choices(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

class CatalogV2 {
  constructor(catalog) {
    this.catalog = catalog;
  }

  getRegions() {
    let regions = [];
    for(let i = 0; i < this.catalog.length; i ++) {
      let rec = this.catalog[i];
      for(let j = 0; j < rec.endpoints.length; j ++) {
        let region = rec.endpoints[j].region;
        if (regions.indexOf(region) < 0) {
          regions.push(region);
        }
      }
    }
    return regions;
  }

  getServiceEndpoints(service, region, zone, endpoint_type) {
    return [this.getServiceEndpoint(service, region, zone, endpoint_type)];
  }

  getServiceEndpoint(service, region, zone, endpoint_type) {
    if (!endpoint_type) {
      endpoint_type = 'internalURL';
    }
    for(let i = 0; i < catalog.length; i ++) {
      if (service === catalog[i].type) {
        let selected = null;
        if (!region) {
          if (catalog[i]['endpoints'].length === 1) {
            selected = catalog[i]['endpoints'][0];
          }else {
            throw new Error("No default region");
          }
        }else {
          let reg_eps = [];
          let zone_eps = [];
          let region_zone = null;
          if (zone) {
            region_zone = region + '/' + zone;
          }
          for(let j = 0; j < catalog[i]['endpoints'].length; j ++) {
            if (catalog[i]['endpoints'][j]['region'] === region) {
              reg_eps.push(catalog[i]['endpoints'][j]);
            }else if(region_zone && catalog[i]['endpoints'][j]['region'] === region_zone) {
              zone_eps.push(catalog[i]['endpoints'][j]);
            }
          }
          if (region_zone && zone_eps.length > 0) {
            selected = random_choices(zone_eps); // randomize for LB
          }else if(reg_eps.length > 0) {
            selected = random_choices(reg_eps); // randomize for LB
          }
        }
        if (selected && selected[endpoint_type]) {
          return selected[endpoint_type];
        }
      }
    }
    throw new Error("No such service ", service, endpoint_type);
  }
}

class TokenCredentialV2 {
  constructor(access) {
    this.token = access.token;
    this.user = access.user;
    this.catalog = new CatalogV2(access.serviceCatalog);
    let roles = [];
    for (let i = 0; i < access.user.roles.length; i ++) {
      roles[i] = access.user.roles[i].name;
    }
    this.roles = roles;
    // console.log('ValidSeconds ' + this.validSeconds())
  }

  getCatalog() {
    return this.catalog;
  }

  getToken() {
    return this.token.id;
  }

  getTenantId() {
    return this.token.tenant.id;
  }

  getProjectId() {
    return this.token.tenant.id;
  }

  getTenantName() {
    return this.token.tenant.name;
  }

  getProjectName() {
    return this.token.tenant.name;
  }

  getUserId() {
    return this.user.id;
  }

  getUserName() {
    return this.user.username;
  }

  getRoles() {
    return this.roles;
  }

  getExpires() {
    return new Date(this.token.expires);
  }

  isValid() {
    let now = new Date();
    if (this.getExpires() < now) {
      return false;
    }else {
      return true;
    }
  }

  validSeconds() {
    let now = new Date();
    return Math.floor((this.getExpires().getTime() - now.getTime())/1000);
  }

  getRegions() {
    return this.catalog.getRegions()
  }

  isSystemAdmin() {
    let roles = this.getRoles();
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'admin') {
        return true
      }
    }
    return false
  }
}

class ClientSession {
  constructor(cli, region, zone, endpoint_type, token, api_version) {
    this.client = cli;
    this.region = region;
    this.zone = zone;
    this.endpoint_type = endpoint_type;
    this.token = token;
    this.api_version = api_version;
    this.modules = {};
    if (!this.endpoint_type) {
      this.endpoint_type = 'internalURL';
    }
  }

  module(name) {
    if (typeof this.modules[name] === 'undefined') {
      this.modules[name] = new this.client[name](this);
    }
    return this.modules[name];
  }

  is_multi_version_service(service) {
    if (service === 'compute') {
      return true;
    } else {
      return false;
    }
  }

  get_default_version(service) {
    if (service === 'compute') {
      return 'v2';
    } else {
      return 'v1';
    }
  }

  get_service_name(service, api_version) {
    if (!api_version) {
      api_version = this.get_default_version(service);
    }
    if (this.is_multi_version_service(service) && api_version && api_version !== 'v1') {
      return service + '_' + api_version;
    }
    return service
  }

  request(service, ep_type, method, url, headers, body) {
    if (!headers) {
      headers = {};
    }
    headers['X-Auth-Token'] = this.token.getToken();
    if (!ep_type) {
      ep_type = this.endpoint_type;
    }
    let baseurl = this.getServiceEndpoint(service, this.region, this.zone, this.endpoint_type);
    baseurl = misc.stripURLVersion(baseurl);
    if (url) {
      baseurl += url;
    }
    return this.client.request(method, baseurl, headers, body);
  }

  jsonRequest(service, ep_type, method, url, headers, body) {
    if (!headers) {
      headers = {};
    }
    headers['X-Auth-Token'] = this.token.getToken();
    if (!ep_type) {
      ep_type = this.endpoint_type;
    }
    let baseurl = this.getServiceEndpoint(service, this.region, this.zone, ep_type);
    baseurl = misc.stripURLVersion(baseurl);
    if (url) {
      baseurl += url;
    }
    return this.client.jsonRequest(method, baseurl, headers, body);
  }

  getServiceEndpoint(service, region, zone, endpoint_type) {
    // first try client catalog, which is up to date
    let catalog = this.client.catalog;
    // find from catalog cached in token
    if (!catalog) {
      catalog = this.token.getCatalog();
    }
    // console.log(catalog, region, zone, service, endpoint_type);
    if (endpoint_type === 'apigateway') {
      const ret = this.getApigatewayEndpoint(catalog, service, region, zone);
      return ret
    } else {
      return catalog.getServiceEndpoint(this.get_service_name(service, this.api_version), region, zone, endpoint_type);
    }
  }

  getApigatewayEndpoint(catalog, service, region, zone) {
    let url = catalog.getServiceEndpoint(this.get_service_name(service, this.api_version), region, zone, '');

    let prefix = this.client.auth_url;
    let lastSlashPos = prefix.lastIndexOf('/api/s/identity');
    if (lastSlashPos <= 0) {
        throw new Error('invalue auth_url ' + this.client.authUrl + ', should be url of apigateway endpoint, e.g. https://<apigateway-host>/api/s/identity/v3');
    }
    prefix = prefix.substring(0, lastSlashPos)
    while (prefix.endsWith('/')) {
      prefix = prefix.substring(0, prefix.length - 1);
    }
    prefix = prefix + '/api/s/' + service;
    if (region && region.length > 0) {
      prefix = prefix + '/r/' + region;
      if (zone && zone.length > 0) {
        prefix = prefix + '/z/' + zone;
      }
    }
    let ret = '';
    if (url.length < 9) {
      throw new Error('invalid url ' + url + ': shorter than 9 bytes');
    }
    let slashPos = url.indexOf('/', 9);
     if (slashPos > 0) {
      url = url.substring(9 + slashPos);
      ret = prefix + '/' + url;
    } else {
      ret = prefix;
    }
    return ret;
  }

  isSystemAdmin() {
    return this.token.isSystemAdmin()
  }
}

module.exports.Client = Client;
