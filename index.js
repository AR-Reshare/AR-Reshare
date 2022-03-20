const App = require('./app');
const Database = require('./classes/database');
const dbCredentials = require('./secrets/dbconnection.json');
const cloudinary = require('cloudinary').v2;
const mediaConfig = require('./secrets/mediaconnection.json');

cloudinary.config(mediaConfig);

const db = new Database(dbCredentials['db']);
const logger = console;
const emailTransporter = null;
const mediaHandler = cloudinary.uploader;

// Initialise application
const app = new App(db, logger, emailTransporter, mediaHandler);

// Test Database connection, then bind app
db.testConnection().then(() => {
    app.listen(8080, () => {
        console.log('Listening on port 8080');
    });
}).catch(console.error);
