const misc = require("../misc");

module.exports = [
{
  cmd: 'user-list',
  args: [
    ['--limit', {metavar: '<LIMIT>', default: 0, help: 'Max items show, 0 means no limit'}],
  ],
  help: 'List users',
  func: (cli, args) => {
    cli.module('users').list(args)
    .then((result) => {
      misc.printList(result, cli.module('users').columns());
    });
  },
},
{
  cmd: 'user-show',
  args: [
    ['id', {metavar: '<ID>', help: 'User ID or Name'}],
  ],
  help: 'Show details of a user',
  func: (cli, args) => {
    cli.module('users').get(args.id)
    .then((result) => {
      misc.printObject(result);
    });
  },
},
];
