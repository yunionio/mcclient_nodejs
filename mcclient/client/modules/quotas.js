const ComputeManager = require("../manager/compute");

class QuotaManager extends ComputeManager {
}

QuotaManager.prototype._keyword = 'quota';
QuotaManager.prototype._keyword_plural = 'quotas';

module.exports = QuotaManager;
