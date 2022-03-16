const App = require('./app');
const Database = require('./classes/database');
const cloudinary = require('cloudinary').v2;
const mediaConfig = require('./secrets/mediaconnection.json');

cloudinary.config(mediaConfig);

const db = new Database({
   connectionString: process.env.DATABASE_URL,
   ssl: {
     rejectUnauthorized: false
   }
 });

const logger = console;
const emailTransporter = null;
const mediaHandler = cloudinary.uploader;

const app = new App(db, logger, emailTransporter, mediaHandler);

db.testConnection().then(() => {
   app.listen(process.env.PORT, () => {
      console.log(`Listening on port 8080`);
   });
}).catch(console.error);
