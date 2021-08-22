const misc = require("../misc");

module.exports = [
{
  cmd: 'vnc-connect',
  args: [
    ['id', {metavar: '<SERVER_ID>', help: 'ID of server to connect'}],
  ],
  help: 'Get URL link to a virtual server',
  func: (cli, args) => {
    cli.module('vncproxy').connect(args.id)
      .then((result) => {
        misc.printObject(result);
      });
  }
},
]
