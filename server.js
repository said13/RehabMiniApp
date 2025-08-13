const { createServer } = require('http');
const next = require('next');
const { runMigrations } = require('./src/db/migrate');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

runMigrations()
  .catch((err) => {
    console.error('Database migration failed', err);
    process.exit(1);
  })
  .then(() => {
    app.prepare().then(() => {
      createServer((req, res) => {
        handle(req, res);
      }).listen(port, () => {
        console.log(`> Server running on http://localhost:${port}`);
      });
    });
  });
