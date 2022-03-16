const {spawn} = require('child_process'); // execute command
const {type} = require('os'); // check OS type
const {randomString} = require('secure-random-password');
const {writeFileSync, readFileSync} = require('fs');
const path = require('path');
// Detect OS
function getOS() {
    const os_dict = {
        'Linux': 'Linux',
        'Darwin': 'MacOS',
        'Windows_NT': 'Windows',
    };

    console.log('Detecting OS...');

    let uname = type();

    if (!(uname in os_dict)) {
        console.log('Your OS was not recognised. Unable to set up the test database.');
        process.exit(0);
    } else {
        console.log(`Your OS was detected as ${os_dict[uname]}.`);
        makePassword(os_dict[uname]);
    }
}

// Generate password
function makePassword(os) {
    // Temporary
    if (os === 'Windows') {
        console.log('This script is not set up for Windows yet. Please install the test database by running the file `db/database-init.pgsql` before conducting tests.');
        process.exit(0);
    } else if (os === 'MacOS') {
        console.log('WARNING: this script has not been tested on MacOS. If you experience problems, please go to scripts/db-test-setup.js and uncomment line 35.');
        // process.exit(0);
    }
    
    console.log('Generating password...');

    let password = randomString({length: 32});

    createDB(os, password);
}

// Create database
function createDB(os, password) {
    console.log('Creating test database...');

    let psqlInit = spawn('sudo',
        ['-u', 'postgres', 'psql', '-f', 'db/database-init.pgsql', '-v', 'account=arresharetest', '-v', `password='${password}'`],
        {stdio: [process.stdin, process.stdout, process.stderr]}
    );

    psqlInit.on('close', (code) => {
        if (code == 0) {
            console.log('Database created successfully');
            populateDB(os, password);
        } else {
            console.error(`Error code ${code}`);
            process.exit(1);
        }
    });

    psqlInit.on('error', (err) => {
        console.error('Failed to start subprocess');
        process.exit(1);
    });
}

// Populate with sample data
function populateDB(os, password) {
    console.log('Populating database...');

    let psqlPopulate = spawn('sudo',
        ['-u', 'postgres', 'psql', '-f', 'db/database-sample.pgsql', '-v', 'account=arresharetest'],
        {stdio: [process.stdin, process.stdout, process.stderr]}
    );

    psqlPopulate.on('close', (code) => {
        if (code == 0) {
            console.log('Database populated successfully');
            saveCreds(os, password);
        } else {
            console.error(`Error code ${code}`);
            process.exit(1);
        }
    });

    psqlPopulate.on('error', (err) => {
        console.error('Failed to start subprocess');
        process.exit(1);
    });
}

// Update credentials
function saveCreds(os, password) {
    let conn_data;
    let dbConnectionPath = `secrets${path.sep}dbconnection.json`;

    try {
        conn_data = JSON.parse(readFileSync(dbConnectionPath));
    } catch (err) {
        conn_data = {};
    }

    if ('test' in conn_data) {
        console.log('test database already detected in credentials file. Overwriting...');
    }

    conn_data['test'] = {
        user: 'arresharetest',
        host: 'localhost',
        database: 'arresharetest',
        password: password,
    };

    try {
        writeFileSync(dbConnectionPath, JSON.stringify(conn_data));
    } catch (err) {
        console.error('Unable to write to credentials file.');
        process.exit(1);
    }

    process.exit(0);
}

getOS();
