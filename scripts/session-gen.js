require('dotenv').config();

const { GITPOD_HOST, GITPOD_AUTH_SESSION } = process.env;

if (!GITPOD_AUTH_SESSION.startsWith('.auth/')) {
    throw new Error('GITPOD_AUTH_SESSION must start with .auth/');
}

if (!GITPOD_HOST || GITPOD_HOST.startsWith('https://')) {
    throw new Error('GITPOD_HOST must be set to the host of your Gitpod instance, e.g. gitpod.io');
}

const { exec, spawn } = require('node:child_process')

spawn('npx', [
    'playwright',
    'codegen',
    `${GITPOD_HOST}/workspaces`,
    `--save-storage=${GITPOD_AUTH_SESSION}`
], {
    stdio: 'inherit',
})
