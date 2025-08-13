const { createServer } = require('http');
const next = require('next');
const { runMigrations } = require('./src/db/migrate');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('Running database migrations');
runMigrations()
  .then(() => {
    console.log('Database migrations complete');
    return app.prepare();
  })
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`> Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
