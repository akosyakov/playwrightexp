require('dotenv').config();
const { writeFileSync } = require('node:fs');
const { spawn } = require('node:child_process');

const { GITPOD_HOST, GITPOD_AUTH_SESSION } = process.env;

if (!GITPOD_HOST || !GITPOD_AUTH_SESSION) {
    writeFileSync(__dirname + '/../.env', `GITPOD_HOST=gitpod.io\nGITPOD_AUTH_SESSION=.auth/io_session.json\n`);
    throw new Error('GITPOD_HOST and GITPOD_AUTH_SESSION must be set. Check your .env file');
}

if (!GITPOD_AUTH_SESSION.startsWith('.auth/')) {
    throw new Error('GITPOD_AUTH_SESSION must start with .auth/');
}

if (GITPOD_HOST.startsWith('https://')) {
    throw new Error('GITPOD_HOST must be set to the host of your Gitpod Installation, e.g. gitpod.io');
}

const logYellow = (str) => {
    console.log('\x1b[33m' + str + '\x1b[0m');
};

logYellow('\x1b[33mDisable recording and log into your Gitpod Installation\x1b[0m');

spawn('npx', ['playwright', 'codegen', `${GITPOD_HOST}/workspaces`, `--save-storage=${GITPOD_AUTH_SESSION}`], {
    stdio: 'inherit',
});
