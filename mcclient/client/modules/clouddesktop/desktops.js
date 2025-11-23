const ClouddesktopManager = require("../../manager/clouddesktop");

class DesktopManager extends ClouddesktopManager {
}

DesktopManager.prototype._keyword = 'desktop';
DesktopManager.prototype._keyword_plural = 'desktops';
DesktopManager.prototype._columns = ['ID', 'Name']

module.exports = DesktopManager;
