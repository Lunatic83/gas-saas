import 'dotenv/config';

if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST environment variable is required for integration tests');
}
