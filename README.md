# AR Reshare

Resharing service created for IBM as part of Durham University's Computer Science course.

This repository contains only the backend system.

## Setup

1. The service uses postgresql as the DBMS. To install and activate postgres:
```
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

2. To set up the database and install dependencies. This may also prompt for root password to set up the database. Check the `scripts` directory to see exactly what this command will do:
```
npm install
```

3. Go to the [`secrets/README.md`](secrets/README.md) file and follow the instructions there to acquire credentials for backend services. All of these services are currently free to use.

4. To test the server code. This may also prompt for root password to set up the test database. Check the `scripts` directory to see exactly what this command will do:
```
npm test
```

5. Start the server:
```
npm start
```
You may wish to change the port number by changing the number on line 17 of `index.js`:
```js
app.listen(8080, () => {
```

## Viewing API docs

If the server is running then API documentation is shown as the index page. If the server is not running, you can serve just the documentation pages to `http://localhost:PORT` by navigating to the `docs` directory and using:
```
python -m http.server PORT
```
