const misc = require("../misc");

module.exports = [
{
  cmd: 'disk-list',
  args: [
    ...misc.defaultListArguments(),
  ],
  help: 'List disks',
  func: function(cli, args) {
    let params = misc.getPagingInfo(args);
    cli.module('disks').list(params)
    .then(function(result) {
      misc.printList(result, cli.module('disks').columns());
    }).catch(function(err) {
      misc.showError(err);
    });
  },
},
{
  cmd: 'disk-show',
  args: [
    ['id', {metavar: '<DISK_ID>', help: 'ID of disk to show'}],
  ],
  help: 'Show details of disk',
  func: function(cli, args) {
    cli.module('disks').get(args.id)
      .then(function(result) {
        misc.printObject(result);
      })
      .catch(function(err) {
        misc.showError(err);
      });
  },
},
];
