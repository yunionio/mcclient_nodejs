const ComputeManager = require("../manager/compute");

class NetworkManager extends ComputeManager {
}

NetworkManager.prototype._keyword = 'network';
NetworkManager.prototype._keyword_plural = 'networks';
NetworkManager.prototype._columns = ['ID', 'Name', 'Guest_ip_start',
                    'Guest_ip_end', 'Guest_ip_mask',
                    'wire_id', 'wire', 'is_public', 'exit', 'Ports', 'vnics',
                    'group_vnics', 'bm_vnics', 'reserve_vnics', 'server_type']

module.exports = NetworkManager;
