const App = require('./app');
const Database = require('./classes/database');
const credentials = require('./connection.json');

const db = new Database(credentials['db']);
const logger = console;

const app = new App(db, logger);

db.testConnection().then(() => {
   app.listen(8080, () => {
      console.log(`Listening on port 8080`);
   });
}).catch(console.error);
