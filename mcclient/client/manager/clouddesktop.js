const StandaloneManager = require('./standalone');

class ClouddesktopManager extends StandaloneManager {
}

ClouddesktopManager.prototype.service_type = 'clouddesktop';

module.exports = ClouddesktopManager;
