const StandaloneManager = require('./standalone');

class IdentityManager extends StandaloneManager {
}

IdentityManager.prototype.service_type = 'identity';
IdentityManager.prototype._version = 'v3';

module.exports = IdentityManager;
