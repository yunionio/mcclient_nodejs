const misc = require("../misc");

module.exports = [
{
  cmd: 'usage',
  args: [
  ],
  help: 'Show general usage statistics',
  func: function(cli, args) {
    cli.module('usages').getGeneralUsage()
      .then(function(result) {
        misc.printObject(result);
      })
      .catch(function(e) {
        misc.showError(e);
      });
  },
},
];
