const {spawn} = require('child_process'); // execute command
const {type} = require('os'); // check OS type
const rl = require('readline-sync'); // https://www.npmjs.com/package/readline-sync for user input
const {randomString} = require('secure-random-password');
const {writeFileSync, readFileSync} = require('fs');
const path = require('path');

/**
 * This script will create the database, plus a password for it, and optionally populate it with sample data
 */

const os_dict = {
    'Linux': 'Linux',
    'Darwin': 'MacOS',
    'Windows_NT': 'Windows',
};

// Confirm desire to setup database
function confirmSetup() {
    if (!rl.keyInYN('Would you like to set up the database?')) {
        cancelSetup();
    }
    checkOS();
}

function cancelSetup() {
    console.log('Cancelling setup. Resume with `npm run setup`');
    process.exit(0);
}

// Detect OS, ask for confirmation
function checkOS() {
    console.log('Detecting OS...');

    let uname = type();
    let os;

    if (!(uname in os_dict)) {
        console.log('Your OS was not recognised.');
    } else {
        if (rl.keyInYN(`Your OS was detected as ${os_dict[uname]}. Is this correct?`) !== false) {
            os = os_dict[uname];
        }
    }

    if (!os) {
        let supported = Object.values(os_dict);
        let index = rl.keyInSelect(supported, 'Which OS are you using?', {cancel: 'Other'});
        if (index == -1) {
            console.log('Your OS is not supported by this script.');
            process.exit(1);
        } else {
            os = supported[index];
            console.log(`Your OS was set to ${os}`);
        }
    }

    // Temporary
    if (os === 'Windows') {
        console.log('This script is not set up for Windows yet. Please install the database by running the file `db/database-init.pgsql`');
        process.exit(0);
    } else if (os === 'MacOS') {
        console.log('WARNING: this script has not been tested on MacOS. If you experience problems, please go to scripts/db-setup.js and uncomment line 63.');
        // process.exit(0);
    }
    checkPostgres(os);
}

// Verify postgres installed
function checkPostgres(os) {
    console.log('Checking postgres...');

    let psqlCheck = spawn('service', ['postgresql', 'status'], {stdio: [process.stdin, process.stdout, process.stderr]});

    psqlCheck.on('close', (code) => {
        if (code === 0) {
            console.log('Postgres detected and already active.');
            askPassword(os);
        } else if (code === 1) {
            console.error('Postgres was not detected. Please go to https://www.postgresql.org/download/ to download postgres.');
            process.exit(1);
        } else if (code === 3) {
            console.error('Postgres detected. Activating...');
            activatePostgres(os, askPassword);
        }
    });

    psqlCheck.on('error', () => {
        console.error('Failed to start subprocess');
        process.exit(1);
    });
}

function activatePostgres(os, cb) {
    console.log('Activating postgres...');

    let psqlActivate = spawn('sudo', ['service', 'postgresql', 'start'], {stdio: [process.stdin, process.stdout, process.stderr]});

    psqlActivate.on('close', (code) => {
        if (code === 0) {
            console.log('Postgres activated.');
            cb(os);
        } else {
            console.error(`Postgres failed to activate (error code ${code})`);
            process.exit(1);
        }
    });

    psqlActivate.on('error', () => {
        console.error('Failed to start subprocess');
        process.exit(1);
    });
}

// Prompt for password (or auto-generate)
function askPassword(os) {
    let password;

    console.log('WARNING: The password will be stored on this system in plaintext. Do not reuse a password that you also use elsewhere.');

    if (rl.keyInYN('Generate a password automatically? (recommended)') !== false) {
        password = randomString({ length: 32 });
    } else {
        password = rl.questionNewPassword('Type password: ', {
            min: 8, max: 32,
            confirmMessage: 'Retype password to confirm: ',
            unmatchMessage: 'Passwords do not match. Retype, or press Enter only to reset.',
        });
    }

    createDB(os, password);
}

// Create database
function createDB(os, password) {
    console.log('Creating database...');

    let psqlInit = spawn('sudo',
        ['-u', 'postgres', 'psql', '-f', 'db/database-init.pgsql', '-v', 'account=arresharedb', '-v', `password='${password}'`],
        {stdio: [process.stdin, process.stdout, process.stderr]}
    );

    psqlInit.on('close', (code) => {
        if (code == 0) {
            console.log('Database created successfully');
            storeConn(os, password);
        } else {
            console.error(`Error code ${code}`);
            process.exit(1);
        }
    });

    psqlInit.on('error', () => {
        console.error('Failed to start subprocess');
        process.exit(1);
    });
}

// Store connection data in connection.json
function storeConn(os, password) {
    console.log('Storing connection credentials...');
    let dbConnectionPath = `secrets${path.sep}dbconnection.json`;

    let conn_data;

    try {
        conn_data = JSON.parse(readFileSync(dbConnectionPath));
    } catch (err) {
        conn_data = {};
    }

    if ('db' in conn_data) {
        console.log('Database already detected in credentials file. Overwriting...');
    }

    conn_data['db'] = {
        user: 'arresharedb',
        host: 'localhost',
        database: 'arresharedb',
        password: password,
    };

    try {
        writeFileSync(dbConnectionPath, JSON.stringify(conn_data));
    } catch (err) {
        console.error('Unable to write to credentials file.');
        process.exit(1);
    }

    createSample(os, password);
}

// Ask whether sample data should be included
function createSample(os, password) {
    if (rl.keyInYN('Populate the database with sample data?')) {
        console.log('Creating sample data...');

        let psqlSample = spawn('sudo',
            ['-u', 'postgres', 'psql', '-f', 'db/database-sample.pgsql', '-v', 'account=arresharedb'],
            {stdio: [process.stdin, process.stdout, process.stderr]}
        );

        psqlSample.on('close', (code) => {
            if (code == 0) {
                console.log('Sample data generated.');
                confirmComplete();
            } else {
                console.error(`Error code ${code}`);
                process.exit(1);
            }
        });

        psqlSample.on('error', () => {
            console.error('Failed to start subprocess');
            process.exit(1);
        });
    } else {
        confirmComplete();
    }
}

// Confirm completion
function confirmComplete(){
    console.log('Database setup successful.');
    process.exit(0);
}

confirmSetup();
