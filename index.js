const App = require('./app');
const Database = require('./classes/database');

const db = new Database({
   connectionString: process.env.DATABASE_URL,
   ssl: {
     rejectUnauthorized: false
   }
 });
const logger = console;

const app = new App(db, logger);

db.testConnection().then(() => {
   app.listen(8080, () => {
      console.log(`Listening on port 8080`);
   });
}).catch(console.error);
