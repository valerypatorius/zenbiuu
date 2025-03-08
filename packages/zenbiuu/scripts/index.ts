#!/usr/bin/env tsx

import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { rm } from 'node:fs/promises';

const [, , mode] = process.argv;

/**
 * Include variables from .env file in process.env
 */
Object.assign(process.env, loadEnv(process.env.NODE_ENV, process.cwd()));

const outDir = resolve(import.meta.dirname, '..', 'dist');

await rm(outDir, {
  recursive: true,
  force: true,
});

switch (mode) {
  case 'dev':
    await import('./dev');
    break;
  case 'build':
    await import('./build');
}
