/* this should just start the app running and listening to a port
   it should probably have some config stuff as well (logging, database credentials, etc.)
*/

const app = require('./app');

app.listen(8080, () => {
   console.log(`Example app listening on port 8080`)
 })
