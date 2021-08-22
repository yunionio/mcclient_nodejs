const ComputeManager = require("../manager/compute");

class WireManager extends ComputeManager {
}

WireManager.prototype._keyword = 'wire';
WireManager.prototype._keyword_plural = 'wires';
WireManager.prototype._columns = ['ID', 'Name', 'Bandwidth'];

module.exports = WireManager;
