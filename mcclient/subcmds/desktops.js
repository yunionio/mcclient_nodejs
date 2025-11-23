const misc = require("../misc");

module.exports = [
{
  cmd: 'desktop-list',
  args: [
    ...misc.defaultListArguments(),
  ],
  help: 'List desktops',
  func: function(cli, args) {
    let params = misc.getPagingInfo(args);
    console.log(cli)
    cli.module('desktops').list(params)
    .then(function(result) {
      misc.printList(result, cli.module('desktops').columns());
    }).catch(function(err) {
      misc.showError(err);
    });
  },
},
{
  cmd: 'desktop-show',
  args: [
    ['id', {metavar: '<DESKTOP_ID>', help: 'ID of desktop to show'}],
  ],
  help: 'Show details of desktop',
  func: function(cli, args) {
    cli.module('desktops').get(args.id)
      .then(function(result) {
        misc.printObject(result);
      })
      .catch(function(err) {
        misc.showError(err);
      });
  },
},
];