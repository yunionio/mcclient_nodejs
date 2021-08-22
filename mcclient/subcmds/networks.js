const misc = require("../misc");

module.exports = [
{
  cmd: 'network-list',
  args: [
    ...misc.defaultListArguments(),
  ],
  help: 'List networks',
  func: function(cli, args) {
    let params = misc.getPagingInfo(args);
    cli.module('networks').list(params)
    .then(function(result) {
      misc.printList(result, cli.module('networks').columns());
    }).catch(function(err) {
      misc.showError(err);
    });
  },
},
];
