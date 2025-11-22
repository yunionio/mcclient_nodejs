'use strict';


const argparse = require('argparse');

function getSubcommands() {
  let subcmds = [];
  const fs = require("fs");
  const path = require("path");
  let subcmdsDir = path.join(__dirname, "subcmds");
  let files = fs.readdirSync(subcmdsDir);
  if (files) {
    for(let i = 0; i < files.length; i ++) {
      let f = files[i];
      if (f.endsWith(".js")) {
        f = f.substr(0, f.length - 3);
        const cmds = require(path.join(subcmdsDir, f));
        cmds.forEach(function(v) {
          subcmds.push(v);
        });
      }
    }
  }
  return subcmds;
}

class Shell {

  constructor() {
    this.subcommands = {};
    this.parser = this.getParser();
  }

  getBasicParser() {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

    let parser = argparse.ArgumentParser({
                      prog: 'climc',
                      description: 'Command-line interface to the API server.',
                      epilog: 'See "climc help COMMAND" for help on a specific command.',
                      add_help: false,
                      formatter_class: argparse.ArgumentDefaultsHelpFormatter});

    parser.add_argument('-h', '--help',
                    {action: 'store_true', help: argparse.SUPPRESS});
    parser.add_argument('--debug',
                    {default: false, action: 'count',
                      help: argparse.SUPPRESS});
    parser.add_argument('--timeout',
                    {type: 'int', default: 600,
                      help: 'Number of seconds to wait for a response'});
    parser.add_argument('--os-username', {default: process.env['OS_USERNAME'], help: 'Defaults to env[OS_USERNAME]'});
    parser.add_argument('--os-password', {default: process.env['OS_PASSWORD'], help: 'Defaults to env[OS_PASSWORD]'});
    parser.add_argument('--os-domain', {default: process.env['OS_DOMAIN_NAME'], help: 'Defaults to env[OS_DOMAIN_NAME]'});
    parser.add_argument('--os-project-id', {default: process.env['OS_PROJECT_ID'], help: 'Defaults to env[OS_PROJECT_ID]'});
    parser.add_argument('--os-project-name', {default: process.env['OS_PROJECT_NAME'], help: 'Defaults to env[OS_PROJECT_NAME]'});
    parser.add_argument('--os-project-domain', {default: process.env['OS_PROJECT_DOMAIN'], help: 'Defaults to env[OS_PROJECT_DOMAIN]'});
    parser.add_argument('--os-auth-url', {default: process.env['OS_AUTH_URL'], help: 'Defaults to env[OS_AUTH_URL]'});
    parser.add_argument('--os-region-name', {default: process.env['OS_REGION_NAME'], help: 'Defaults to env[OS_REGION_NAME]'});
    parser.add_argument('--os-zone-name', {default: process.env['OS_ZONE_NAME'], help: 'Defaults to env[OS_ZONE_NAME]'});
    parser.add_argument('--api-version', {default: process.env['API_VERSION'], help: 'Defaults to env[API_VERSION] or v1'});
    parser.add_argument('--os-endpoint-type', {default: (process.env['OS_ENDPOINT_TYPE'] ? process.env['OS_ENDPOINT_TYPE']:'publicURL'), choices: ['publicULR', 'internalURL', 'apigateway'], help: 'Defaults to env[OS_ENDPOINT_TYPE] or publicURL'});
    return parser;
  }

  getParser() {
    let parser = this.getBasicParser();
    let subparsers = parser.add_subparsers({metavar: '<SUBCOMMAND>', title: 'subcommand', dest: 'subcommand'});
    this.findSubcmds(subparsers);
    return parser;
  }

  unknownCommand(cmd) {
    this.parser.print_help();
    throw new Error('Error: unknown subcommand "' + cmd + '"');
  }

  run() {
    let basicparser = this.getBasicParser();
    let options = basicparser.parse_known_args();

    if (options[0].help) {
      this.parser.print_help();
      return;
    }

    let args = this.parser.parse_args();

    if (!args.os_auth_url) {
      throw new Error('Missing os_auth_url');
    }
    if (!args.os_username) {
      throw new Error('Missing os_username');
    }
    if (!args.os_password) {
      throw new Error('Missing os_password');
    }
    if (!args.os_project_id && !args.os_project_name) {
      throw new Error('Missing os_project_id or os_project_name');
    }

    let subcmd = this.subcommands[args.subcommand];
    if (subcmd) {
      const client = require('./client');
      let cli = new client.Client(args.os_auth_url, args.timeout, args.debug);

      cli.auth(args.os_username, args.os_password, args.os_domain,
                  args.os_project_id,
                  args.os_project_name, args.os_project_domain).then(function(token) {
                    let clii = cli.session(args.os_region_name,
                                      args.os_zone_name,
                                      args.os_endpoint_type,
                                      token,
                                      args.api_version,
                                    );
                    subcmd[1](clii, args);
                  }).catch(function(err) {
                    console.error("Invalid credential:" + err);
                  });
    }else {
      this.unknownCommand(args.subcommand);
    }
  }

  findSubcmds(subparsers) {
    let subcmds = getSubcommands();
    let self = this;
    subcmds[subcmds.length] = {
      cmd: 'help',
      help: 'Show help of subcommand',
      args: [
        ['command', {help: 'Subcommand', metavar: '<COMMAND>'}],
      ],
      func: function(cli, args) {
        let subparser = self.subcommands[args.command];
        if (subparser) {
          subparser[0].print_help();
        }else {
          self.unknownCommand(args.command);
        }
      },
    };
    for (let i = 0; i < subcmds.length; i ++) {
      let subcmd = subcmds[i];
      let parser = subparsers.add_parser(subcmd.cmd,
                  {add_help: false, description: subcmd.help});
      for (let j = 0; j < subcmd.args.length; j ++) {
        let arg = subcmd.args[j];
        parser.add_argument(arg[0], arg[1]);
      }
      this.subcommands[subcmd.cmd] = [parser, subcmd.func];
    }
  }
}

module.exports = Shell;
