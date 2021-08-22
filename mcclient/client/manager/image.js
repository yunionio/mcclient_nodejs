const StandaloneManager = require('./standalone');

class GlanceManager extends StandaloneManager {
}

GlanceManager.prototype.service_type = 'image';
GlanceManager.prototype._version = 'v1';

module.exports = GlanceManager;
