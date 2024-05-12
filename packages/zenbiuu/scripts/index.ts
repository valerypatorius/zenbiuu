#!/usr/bin/env tsx

import { loadEnv } from 'vite';

const [
  ,
  ,
  mode,
] = process.argv;

/**
 * Include variables from .env file in process.env
 */
Object.assign(process.env, loadEnv(process.env.NODE_ENV, process.cwd()));

switch (mode) {
  case 'dev':
    await import('./dev');
    break;
  case 'build':
    await import('./build');
}

export {};
