const {writeFileSync} = require('fs');
const {randomString} = require('secure-random-password');

writeFileSync('private.key', randomString({length: 128}));
