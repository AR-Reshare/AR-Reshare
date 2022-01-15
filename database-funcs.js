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
 * Executes a query on the database
 * @async
 * @param {string} queryTemplate - The query to execute, which may be parameterised 
 * @param {string[]} [values=[]] - (Optional, Array) The values to substitute into the parameterised query
 * @returns {Promise<Object[]>} Promise object which resolves with an array of results from the query. Each object in the array corresponds to a row returned from the query. Keys of the object correspond to fields returned, in lowercase.
 */
const simpleQuery = (queryTemplate, values=[]) => {
    return new Promise((resolve, reject) => {
        pool.query(queryTemplate, values).then(res => {
            resolve(res.rows);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * Executes a set of queries in order as a single transaction.
 * @async
 * @param {Object[]} queries - An array of query objects to be executed. Can be either strings, with no parameters, or objects with:
 * queries.text - The query to execute, which may be parameterised;
 * queries.values - (Optional, Array) The values to substitute into the parameterised query
 * @returns {Promise<Object[][]>} Promise object which resolves with an array of arrays containing the results from each query. Subarrays correspond to queries i.e. results of the 3rd query will be in the 3rd position of the array. Each object in a subarray corresponds to a row returned from the query. Keys of the object correspond to fields returned, in lowercase.
 */
const complexQuery = (queries) => {
    return new Promise((resolve, reject) => {
        pool.connect().then(client => {
            let err, result = [];

            client.query('BEGIN').then(() => {
                // treats queries as a queue. This function takes the first one, executes it, and appends the results to the "global" (from the function's perspective) result variable, then does the next one recursively
                let nextQueryHandler = () => {
                    return new Promise((rslv, rjct) => {
                        let nextquery = queries.shift();

                        client.query(nextquery).then(res => {
                            result.push(res.rows);

                            if (queries.length == 0) {
                                // base case
                                return client.query('COMMIT');
                            } else {
                                // recursive case
                                return nextQueryHandler();
                            }
                        }).then(rslv, rjct); // propogate resolve or reject back to top level
                    });
                }

                return nextQueryHandler();
            }).catch(e => {
                err = e;
                return client.query('ROLLBACK');
            }).finally(() => {
                client.release();
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch(err => {
            reject(err);
        })
    });
}

// Test code

/*
// simpleQuery()
simpleQuery('INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ($1, $2, $3)', ['Testy McTestFace', 'testyMcT@testington.net', 'abcdefghjik']).then(rows=>{
    console.log('Success');

    simpleQuery('INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ($1, $2, $3) RETURNING UserID', ['Kevin McTestFace', 'kev@gmail.com', 'Capital-P-Assword 1 2 3']).then(rows => {
        rows.forEach(element => {
            console.log(element);
        });

        simpleQuery('SELECT NOW() AS now').then(rows => {
            console.log(rows);

            simpleQuery('SELECT PassHash FROM Account WHERE UserName LIKE $1', ['%McTestFace']).then(rows => {
                rows.forEach(element => {
                    console.log(element);
                });
                process.exit();
            }).catch(err => {
                console.error(err);
            });
            

        }).catch(err => {
            console.error();
        });

    }).catch(err => {
        console.error(err);
    });

}).catch(err => {
    console.error(err);
});
*/

/*
// complexQuery()
let queries = [
    {
        text: 'INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ($1, $2, $3)',
        values: ['Testy McTestFace', 'testyMcT@testington.net', 'abcdefghjik'],
    },
    {
        text: 'INSERT INTO Account (UserName, UserEmail, PassHash) VALUES ($1, $2, $3) RETURNING UserID',
        values: ['Kevin McTestFace', 'kev@gmail.com', 'Capital-P-Assword 1 2 3'],
    },
    {
        text: 'SELECT NOW() AS now',
        values: [],
    },
    {
        text: 'SELECT PassHash FROM Account WHERE UserName LIKE $1',
        values: ['%McTestFace'],
    },
]

complexQuery(queries).then(res => {
    console.log(res);
}).catch(err => {
    console.error(err);
}).finally(() => {
    process.exit();
});
*/
