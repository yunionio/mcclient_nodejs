const StandaloneManager = require('./standalone');

class ComputeManager extends StandaloneManager {
}

ComputeManager.prototype.service_type = 'compute';

module.exports = ComputeManager;
