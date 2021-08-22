const misc = require("../misc");

module.exports = [
{
  cmd: 'wire-list',
  args: [
    ...misc.defaultListArguments(),
  ],
  help: 'List wires',
  func: function(cli, args) {
    let params = misc.getPagingInfo(args);
    cli.module('wires').list(params)
    .then(function(result) {
      misc.printList(result, cli.module('wires').columns());
    }).catch(function(err) {
      console.error(err);
    });
  },
},
];
