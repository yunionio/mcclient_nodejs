const uuid4 = require("uuid4");


class SessionManager {
  constructor(cli) {
    this.client = cli;
    this.table = {};
  }

  save(token) {
    let self = this;
    let id = '' + uuid4();
    this.table[id] = token;
    /* setTimeout(function() {
      self.remove(id);
    }, token.validSeconds()*1000); */
    return id;
  }

  get(tid) {
    return this.table[tid];
  }

  remove(tid) {
    console.log('Remove token ' + tid);
    if (this.table[tid]) {
      delete this.table[tid];
    }
  }
}

module.exports = SessionManager;
