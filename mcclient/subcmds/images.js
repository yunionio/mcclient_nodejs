const misc = require("../misc");

module.exports = [
{
  cmd: 'image-list',
  args: [
          ['--owner-id', {metavar: '<OWNER>', help: 'Tenant id of image owner'}],
          ['--tenant', {metavar: '<TENANT>', help: 'Image owner'}],
          ['--is-public', {metavar: '<IS_PUBLIC>', choices: ['True', 'False', 'None', 'true', 'false', 'none'], help: 'filter images public or not(True, False or None)'}],
          ['--admin', {action: 'store_true', help: 'Show images of all tenants, ADMIN only'}],
          ['--limit', {metavar: '<LIMIT>', default: 0, help: 'Max items show, 0 means no limit'}],
          ['--marker', {metavar: '<MARKER>', help: 'The last Image ID of the previous page'}],
          ['--history', {action: 'store_true', help: 'Show images with all history'}],
          ['--name', {metavar: '<NAME>', help: 'Name filter'}],
  ],
  help: 'List images',
  func: function(cli, args) {
    let params = misc.getPagingInfo(args);
    cli.module('images').list(params)
    .then(function(result) {
      misc.printList(result, cli.module('images').columns());
    });
  },
},
{
  cmd: 'image-show',
  args: [
    ['id', {metavar: '<IMAGE_ID>', help: 'Image ID or name to show'}],
  ],
  help: 'Show image details',
  func: function(cli, args) {
    cli.module('images').get(args.id)
      .then(function(result) {
        misc.printObject(result);
      });
  },
},
];
