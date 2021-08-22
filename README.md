# Nodejs SDK for Cloudpods API

This repository provides Nodejs SDK for Cloudpods API.

Based on the SDK, a simple nodejs version of climc was implemented as a usage example of SDK.

## Setup

```bash
npm install
```

## run climc of nodejs version

```bash
./bin/climc server-list
```

## use SDK in your nodejs program

```javascript
  const client = require('mcclient/client');
  let cli = new client.Client(os_auth_url, timeout, debug);

  cli.auth(os_username, os_password, os_domain, os_project_id, os_project_name, os_project_domain)
    .then((token) => {
       let s = cli.session(os_region_name, os_zone_name, os_endpoint_type, token, api_version);
       s.module("servers").list({limit: 100})
         .then((result) => {
             const misc = require("mcclient/misc");        
             misc.printList(result, cli.module('servers').columns());
           })
    }).catch((err) => {
      console.error("Invalid credential:" + err);
    });
```

## Note: nodejs version of mcclient is experimental, you are welcome to contribe to make it complete
