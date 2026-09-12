import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || fileURLToPath(new URL('../../.env', import.meta.url)),
  quiet: true,
});
