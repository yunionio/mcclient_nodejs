const ComputeManager = require("../../manager/compute");

class HostManager extends ComputeManager {
}

HostManager.prototype._keyword = 'host';
HostManager.prototype._keyword_plural = 'hosts';
HostManager.prototype._columns = ['ID', 'Name', 'Access_ip', 'Manager_URI',
                                    'Status', 'Guests', 'Running_guests',
                                    'storage', 'storage_used',
                                    'storage_virtual', 'disk_used',
                                    'storage_free', 'storage_commit_rate',
                                    'mem_size', 'mem_used', 'mem_free',
                                    'mem_commit', 'cpu_count', 'cpu_used',
                                    'cpu_commit', 'cpu_commit_rate',
                                    'mem_commit_rate', 'cpu_commit_bound',
                                    'mem_commit_bound'];

module.exports = HostManager;
