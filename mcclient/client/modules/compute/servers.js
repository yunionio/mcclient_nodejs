const ComputeManager = require("../../manager/compute");

class ServerManager extends ComputeManager {
}

ServerManager.prototype._keyword = 'server';
ServerManager.prototype._keyword_plural = 'servers';
ServerManager.prototype._columns = ['ID', 'Name', 'Billing_type',
                          'IPs', 'Disk', 'Status', 'vcpu_count',
                          'vmem_size', 'ext_bw', 'Zone_name',
                          'Secgroup', 'Secgrp_id'];
ServerManager.prototype._admin_columns = ['Host', 'Tenant', 'is_system'];

module.exports = ServerManager;
