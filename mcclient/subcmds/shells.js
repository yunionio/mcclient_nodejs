const misc = require("../misc");

module.exports = [
{
  cmd: 'region-list',
  args: [
  ],
  help: 'List regions',
  func: function(cli, args) {
    let regions = cli.token.getRegions();
    let data = [];
    for(let i = 0; i < regions.length; i ++) {
      data.push({name: regions[i]})
    }
    misc.printList(data);
  },
},
];
