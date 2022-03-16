const {spawn} = require('child_process'); // execute command
const {type} = require('os'); // check OS type
const rl = require('readline-sync');
const {writeFileSync, readFileSync} = require('fs');
const path = require('path');
// confirm
function confirmSetup() {
    if (!rl.keyInYN('Are you absolutely sure you want to remove the database?')) {
        console.log('Aborting...');
        process.exit(0);
    }
    getOS();
}

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
        console.log('Your OS was not recognised.');
        process.exit(1);
    } else {
        let os = os_dict[uname];
        console.log(`Your OS was detected as ${os}.`);

        // Temporary
        if (os === 'Windows') {
            console.log('This script is not set up for Windows yet. Please remove the database by running the file `db/database-clear.pgsql`');
            process.exit(0);
        } else if (os === 'MacOS') {
            console.log('WARNING: this script has not been tested on MacOS. If you experience problems, please go to scripts/db-teardown.js and uncomment line 30.');
            // process.exit(0);
        }

        removeDB(os);
    }
}

// Remove database
function removeDB(os) {
    console.log('Deleting database...');

    let psqlInit = spawn('sudo',
        ['-u', 'postgres', 'psql', '-f', 'db/database-clean.pgsql', '-v', 'account=arresharedb'],
        {stdio: [process.stdin, process.stdout, process.stderr]}
    );

    psqlInit.on('close', (code) => {
        if (code == 0) {
            console.log('Database dropped successfully');
            removeCreds(os);
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

// Update credentials
function removeCreds(os) {
    let conn_data;
    let dbConnectionPath = `secrets${path.sep}dbconnection.json`;

    try {
        conn_data = JSON.parse(readFileSync(dbConnectionPath));
    } catch (err) {
        conn_data = {};
    }

    delete conn_data['db'];

    try {
        writeFileSync(dbConnectionPath, JSON.stringify(conn_data));
    } catch (err) {
        console.error('Unable to write to credentials file.');
        process.exit(1);
    }

    process.exit(0);
}

confirmSetup();
