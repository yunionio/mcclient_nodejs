const querystring = require("querystring");
const IdentityManager = require("../manager/identity");

class UserManager extends IdentityManager {
}

UserManager.prototype.endpoint_type = 'adminURL'
UserManager.prototype._keyword = 'user';
UserManager.prototype._keyword_plural = 'users';
UserManager.prototype._columns = []
UserManager.prototype._admin_columns = ['ID', 'Name', 'TenantId',
        'Tenant_name', 'Enabled', 'Email', 'Mobile', 'Displayname']

module.exports = UserManager;
