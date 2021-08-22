const ComputeManager = require("../manager/compute");

class DiskManager extends ComputeManager {
}

DiskManager.prototype._keyword = 'disk';
DiskManager.prototype._keyword_plural = 'disks';
DiskManager.prototype._columns = ['ID', 'Name', 'Disk_size', 'Status',
                                  'Disk_format', 'Is_public',
                                  'Guest_count', 'Storage_type']
DiskManager.prototype._admin_columns = ['Storage', 'Tenant'];

module.exports = DiskManager;
