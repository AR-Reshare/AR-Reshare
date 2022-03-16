const {writeFileSync} = require('fs');
const {randomString} = require('secure-random-password');
const path = require('path')

writeFileSync(`secrets${path.sep}jwtsymmetric.key`, randomString({length: 128}));
console.log('Private key generated');
