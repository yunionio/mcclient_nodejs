function getPropertyNameIgnoreCase(obj, name) {
  let upperName = name.toUpperCase();
  let keys = Object.keys(obj);
  for(let i = 0; i < keys.length; i ++) {
    if (keys[i].toUpperCase() == upperName) {
      return keys[i];
    }
  }
  return null;
}

function printList(data, fields) {
  let title = null;
  let objs = [];
  if (data.constructor === Array) {
    if(data.length > 0) {
      title = "Total: " + data.length;
    }
    objs = data;
  }else {
    if (data.limit) {
      let pages = Math.floor(data.total/data.limit);
      if (pages*data.limit < data.total) {
        pages += 1;
      }
      let page = Math.floor(data.offset/data.limit) + 1;
      title = "Total: " + data.total + " Pages: " + pages + " Limit: " + data.limit + " Offset: " + data.offset + " Page: " + page;
    }else {
      title = "Total: " + (data.data ? data.data.length:0);
    }
    if (data.data) {
      objs = data.data;
    }
  }
  if (!fields) {
    fields = [];
    for (let i = 0; i < objs.length; i ++) {
      let keys = Object.keys(objs[i]);
      for (let j = 0; j < keys.length; j ++) {
          let key = keys[j].toUpperCase();
          if (fields.indexOf(key) === -1) {
            fields.push(key);
          }
      }
    }
  }
  let rows = [];
  for (let i = 0; i < objs.length; i ++) {
    let row = [];
    for (let j = 0; j < fields.length; j ++) {
      let fname = fields[j].toLowerCase().replace(' ', '_');
      let key = getPropertyNameIgnoreCase(objs[i], fname);
      let data = null;
      if (key) {
        data = objs[i][key];
      }
      if (!data) {
        data = '';
      } else if (data.constructor.name !== 'String') {
        data = JSON.stringify(data);
      }
      row.push(data);
    }
    rows.push(row);
  }
  const Table = require('cli-table3');
  let table = new Table({ head: fields });
  rows.forEach(row => table.push(row));
  console.log(table.toString());
  if (title) {
    console.log('****', title, '****');
  }
}

function defaultListArguments() {
  return [
    ['--limit', {help: 'Maximal items per page', default: 20, metavar: '<LIMIT>'}],
    ['--offset', {help: 'Starting offset', metavar: '<OFFSET>'}],
    ['--order-by', {help: 'Order by specific field', metavar: '<FIELD_NAME>'}],
    ['--order', {help: 'Ascending or descending order', metavar: '<ORDER>', choices: ['desc', 'asc']}],
    ['--details', {action: 'store_true', help: 'More detailed list'}],
    ['--search', {metavar: '<KEYWORD>', help: 'Filter result by simple keyword search'}],
    ['--meta', {action: 'store_true', help: 'Piggyback metadata'}],
    ['--filter', {metavar: '<FILTER>', action: 'append', help: 'Filters'}],
    ['--filter-any', {action: 'store_true', help: 'If true, match if any of the filters matches; otherwise, match if all of the filters match'}],
    ['--admin', {action: 'store_true', help: 'Is admin call?'}],
    ['--tenant', {metavar: '<TENANT>', help: 'Tenant ID or Name'}],
    ['--user', {metavar: '<USER>', help: 'User ID or Name'}],
    ['--system', {action: 'store_true', help: 'Show system objects?'}],
    ['--field', {metavar: '<FIELD>', action: 'append', help: 'Show only specified fields'}],
  ];
}

function getPagingInfo(args) {
  let info = {};
  if (args.limit) {
    info.limit = args.limit;
  }
  if (args.offset) {
    info.offset = args.offset;
  }
  if (args.order_by) {
    info.order_by = args.order_by;
    if (args.order) {
      info.order = args.order;
    }
  }
  if (args.details) {
    info.details = true;
  }else {
    info.details = false;
  }
  if (args.search) {
    info.search = args.search;
  }
  if (args.meta) {
    info.with_meta = true;
  }
  if (args.filter) {
    for(let i = 0; i < args.filter.length; i ++) {
      info['filter.' + i] = args.filter[i];
    }
    if (args.filter_any) {
      info.filter_any = true;
    }
  }
  if (args.admin) {
    info.admin = true;
  }
  if (args.system) {
    info.system = true;
  }
  if (args.tenant) {
    info.admin = true;
    info.tenant = args.tenant;
  }
  if (args.user) {
    info.admin = true;
    info.user = args.user;
  }
  if (args.field) {
    for(let i = 0; i < args.field.length; i ++) {
      info['field.' + i] = args.field[i];
    }
  }
  return info;
}

function stripURLVersion(url) {
  let endidx = url.length - 1;
  while (endidx >= 0 && url[endidx] === '/') {
    endidx -= 1;
  }
  let lastslash = url.lastIndexOf('/', endidx);
  if (lastslash >= 0) {
    if (/^v\d+\.?\d*/.test(url.substr(lastslash+1, endidx - lastslash))) {
      return url.substr(0, lastslash);
    }
  }
  return url.substr(0, endidx+1);
}

function printObject(obj) {
  let keys = Object.keys(obj);
  let fields = ['Property', 'Value'];
  let rows = [];
  for(let i = 0; i < keys.length; i ++) {
    let k = keys[i];
    let v = obj[k];
    if (!v) {
      v = ''
    } else if (v.constructor.name !== 'String') {
      v = JSON.stringify(v)
    }
    rows.push([k, v]);
  }
  const Table = require('cli-table3');
  let table = new Table({ head: fields });
  rows.forEach(row => table.push(row));
  console.log(table.toString());
}

function printMultiResult(result, fields) {
  let succ = [];
  let fail = [];
  for (let i = 0; i < result.length; i++) {
    if (result[i].status < 400) {
      succ.push(result[i].data);
    }else {
      fail.push(result[i]);
    }
  }
  if (succ.length > 0) {
    printList(succ, fields);
  }else {
    printList(fail);
  }
}

const HTTP_STATUS = {
  200: 'OK',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  511: 'Network Authentication Required'
}

function showError(e) {
  let msg = e.message
  let msglet = ''
  if (e.status && e.class) {
    msglet = e.class + '/' + e.status
  } else if (e.status) {
    msglet = '' + e.status + ' ' + HTTP_STATUS[e.status]
  }
  if (msglet) {
    msg += ' (' + msglet + ')'
  }
  console.error('Error: ' + msg);
  process.exit(-1);
}

module.exports = {
  getPropertyNameIgnoreCase: getPropertyNameIgnoreCase,
  printList: printList,
  defaultListArguments: defaultListArguments,
  getPagingInfo: getPagingInfo,
  stripURLVersion: stripURLVersion,
  printObject: printObject,
  printMultiResult: printMultiResult,
  showError: showError,
};
