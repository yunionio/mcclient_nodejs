const misc = require("../misc");

module.exports = [
{
  cmd: 'host-list',
  args: [
    ...misc.defaultListArguments(),
  ],
  help: 'List hosts',
  func: function(cli, args) {
    let params = misc.getPagingInfo(args);
    cli.module('hosts').list(params)
    .then(function(result) {
      misc.printList(result, cli.module('hosts').columns());
    });
  },
},
];
