const {spawn} = require('child_process'); // execute command
const {type} = require('os'); // check OS type
const {randomString} = require('secure-random-password');
const {writeFileSync, readFileSync} = require('fs');

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
        console.log(`Your OS was detected as ${os_dict[uname]}.`);
        removeDB(os_dict[uname]);
    }
}

// Remove database
function removeDB(os) {
    console.log('Deleting test database...');

    let psqlInit = spawn('sudo',
        ['-u', 'postgres', 'psql', '-f', 'db/database-clean.pgsql', '-v', 'account=arresharetest'],
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

    try {
        conn_data = JSON.parse(readFileSync('connection.json'));
    } catch (err) {
        conn_data = {};
    }

    delete conn_data['test'];

    try {
        writeFileSync('connection.json', JSON.stringify(conn_data));
    } catch (err) {
        console.error('Unable to write to credentials file.')
        process.exit(1);
    }

    process.exit(0);
}

getOS();
