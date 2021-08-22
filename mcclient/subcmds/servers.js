const misc = require("../misc");

module.exports = [
{
  cmd: 'server-list',
  args: [
    ...misc.defaultListArguments(),
    ['--host', {metavar: '<HOST>', help: 'Show servers on the hosts'}],
    ['--cluster', {metavar: '<CLUSTER>', help: 'Show servers in the cluster'}],
    ['--zone', {metavar: '<ZONE>', help: 'Show servers in the zone'}],
    ['--baremetal', {action: 'store_true', help: 'Show baremetal servers'}],
  ],
  help: 'List servers',
  func: (cli, args) => {
    let params = misc.getPagingInfo(args);
    cli.module('servers').list(params)
      .then((result) => {
        misc.printList(result, cli.module('servers').columns());
      });
  },
},
{
  cmd: 'server-start',
  args: [
    ['id', {metavar: '<SERVER_ID>', action: 'append', help: 'ID of virtual server to start'}],
    ['--qemu-version', {metavar: '<QEMU_VERSION>', help: 'Suggest a qemu version'}],
  ],
  help: 'Start one or more virtual server',
  func: (cli, args) => {
    let params = {}
    if (args.qemu_version) {
      params.qemu_version = args.qemu_version
    }
    cli.module('servers').batchPerformAction(args.id, 'start', params)
      .then((result) => {
        misc.printMultiResult(result, cli.module('servers').columns());
      });
  }
},
{
  cmd: 'server-stop',
  args: [
    ['id', {metavar: '<SERVER_ID>', action: 'append', help: 'ID of virtual server to stop'}],
    ['--force', {action: 'store_true', help: 'Shutdown VM server by force'}],
  ],
  help: 'Stop one or more virtual server',
  func: (cli, args) => {
    let params = {}
    if (args.force) {
      params.is_force = true
    }else {
      params.is_force = false
    }
    cli.module('servers').batchPerformAction(args.id, 'stop', params)
      .then((result) => {
        misc.printMultiResult(result, cli.module('servers').columns());
      });
  }
},
{
  cmd: 'server-update',
  args: [
    ['id', {metavar: '<SERVER_ID>', action: 'append', help: 'ID of virtual server to update'}],
    ['--desc', {metavar: '<DESCRIPTION>', help: 'Description of VM'}],
    ['--disable-delete', {metavar: '<DISABLE_DELETE>', choices: ['true', 'false'], help: 'Disable delete'}],
  ],
  help: 'Update server',
  func: function(cli, args) {
    let params = {}
    if (args.desc) {
      params.description = args.desc
    }
    if (args.disable_delete) {
      if (args.disable_delete === 'true') {
        params.disable_delete = true
      } else {
        params.disable_delete = false
      }
    }
    cli.module('servers').batchUpdate(args.id, params)
      .then((result) => {
        misc.printMultiResult(result, cli.module('servers').columns());
      });
  },
},
{
  cmd: 'server-show',
  args: [
    ['id', {metavar: '<SERVER_ID>', help: 'ID of virtual server to update'}],
  ],
  help: 'Show details of a VM server',
  func: function (cli, args) {
    cli.module('servers').get(args.id)
      .then((result) => {
        misc.printObject(result);
      });
      /* .catch((err) => {
        console.log(err.message);
      }); */
  },
},
{
  cmd: 'server-delete',
  args: [
    ['id', {metavar: '<SERVER_ID>', action: 'append', help: 'ID of virtual server to update'}],
  ],
  help: 'Delete VM servers',
  func: function (cli, args) {
    cli.module('servers').batchDelete(args.id)
      .then((result) => {
        misc.printMultiResult(result, cli.module('servers').columns());
      });
  },
},
];
