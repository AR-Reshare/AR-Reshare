/* This file will create the database connection and define the functions used for accessing the database directly
 * at a lower level than Pipeline.Store()
 * This is separated to help with securing the database connection
 */

// any credentials that have ever touched GitHub are NOT suitable for a production environment. These need to be abstracted to a different file before this system goes live.
const db_credentials = {
    user: 'arresharedev',
    host: 'localhost',
    database: 'arresharedev',
    password: 'SVh}Q,A>3.nL9vp~',
};

const {Pool} = require('pg');

const pool = new Pool(db_credentials);

/**
 * Executes a command on the database. A command is a query which does not have a return value - it either works or it doesn't.
 * @async
 * @param {string} queryTemplate - The query to execute, which may be parameterised
 * @param {string[]} [values=[]] - (Optional) The values to substitute into the parameterised query
 * @returns {Promise} Promise object which resolves if the query was successful and rejects with an error if it wasn't.
 */
const executeCommand = (queryTemplate, values=[]) => {
    return new Promise((resolve, reject) => {
        pool.query(queryTemplate, values).then(res => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
}


// Test code
executeCommand('INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ($1, $2, $3)', ['Testy McTestFace', 'testyMcT@testington.net', 'abcdefghjik']).then(()=>{
    console.log('Success');
    process.exit();
}).catch(err => {
    console.error(err);
});
