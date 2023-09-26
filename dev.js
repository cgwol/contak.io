#!/usr/bin/env node
import { fork } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';
import { asyncNonEmptyQuestion, asyncQuestion, asyncSpawn, cmd, restrictAccess, sleep } from './tools/os.js';
import { addPgpassEntry } from './tools/pgpass.js';

const asyncGetSupabaseProjectRef = async () => {
    const SUPABASE_PROJECT_ID_PATH = 'supabase/.temp/project-ref';
    try {
        return readFileSync(SUPABASE_PROJECT_ID_PATH, { encoding: 'utf-8' }).trim();
    } catch (error) {
        const defaultProjectRef = 'ontjcsevddaxmnnzjfqb';
        let projectRef = '';
        do {
            projectRef = (await asyncQuestion(`Enter Supabase project ref (default = ${defaultProjectRef}): `)).trim() || defaultProjectRef;
        } while (!cmd(`npx supabase link --project-ref ${projectRef} <<< ""`).ok)
        return projectRef;
    }
}

const asyncGetSupabaseAccessToken = async () => {
    const ACCESS_TOKEN_PATH = 'supabase/.temp/access_token';
    try {
        return readFileSync(ACCESS_TOKEN_PATH, { encoding: 'utf-8' }).trim();
    } catch (error) {
        let accessToken = '';
        do {
            accessToken = await asyncNonEmptyQuestion(!accessToken ? 'You can generate an access token from https://app.supabase.com/account/tokens.\nEnter Supabase access token: ' : '\nAccess token: ');
        } while (!cmd(`npx supabase login << '${accessToken}'\n`).ok)
        writeFileSync(ACCESS_TOKEN_PATH, accessToken, { encoding: 'utf-8' });
        return accessToken;
    }
}

/**
 * Writes all top-level, string/number/object properties on `json` object to `envFile`
 * Properly esacpes '$' characters as required by vite
 * @param {object} json 
 * @param {import('fs').PathOrFileDescriptor} envFile
 * @returns 
 */
const writeJsonToEnv = (json, envFile) => {
    let env = '';
    for (const [key, value] of Object.entries(json)) {
        if (typeof value === 'string')
            env += `${key.toUpperCase()}=${value.replaceAll('$', '\\$')}\n`;
        else if (typeof value === 'object')
            env += `${key.toUpperCase()}=${JSON.stringify(value).replaceAll('$', '\\$')}\n`;
        else if (typeof value === 'number' || typeof value === 'boolean')
            env += `${key.toUpperCase()}=${value}\n`;
    }
    writeFileSync(envFile, env);
    return env;
}


const onExit = async () => {
    const yesNo = await asyncQuestion('Do you want to stop supabase? (yes/no) ');
    if (yesNo.charAt(0).toLowerCase() === 'y') {
        console.log('Ok, stopping local supabase instance...');
        await asyncSpawn('npx', ['supabase', 'stop', '--no-backup']);
    }
    process.exit(0);
}

['beforeExit', 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM']
    .forEach(signal => process.once(signal, onExit));

(async function Main() {
    const [major, minor, patch] = process.version.split('.').map(part => part.startsWith('v') ? +part.substring(1) : +part);
    if (major < 18) {
        if ((await asyncQuestion(`node version '${process.version}' is out of date, would you like to update ot most recent version? (yes/no) `)).charAt(0).toLowerCase() === 'y') {
            if (!cmd(`nvm install lts --reinstall-packages-from=node`).ok) {
                console.error('Could not update node to latest version. Node >= 18 is required for snaplet restore.');
                return;
            }
            console.log('Run commands above (if any) with admin permission and restart this script to use new node version...');
            return;
        }
    }

    if (!cmd('psql --version', true).ok) {
        console.error(
            `PostgreSQL is required to run local database. Install postgres for your system at "https://www.postgresql.org/download/"
If it is already installed, make sure the bin folder is added to your PATH environment variable, then restart your terminal or computer.`);
        return;
    }

    const DEV_ENV = path.resolve('.env.development');
    // const PROD_ENV = path.resolve('.env.development');//'.env.production';
    const PROD_ENV = path.resolve('.env.production');//'.env.production';
    const SNAPLET_SNAPSHOT_DIR = path.resolve('.snaplet/snapshots');

    console.log('Insuring supabase services are started...')
    if (!cmd('npx supabase status', true).ok) {
        // await asyncSpawn('npx', ['supabase', 'start']);
        cmd('npx supabase start');
    }

    console.log(`Creating development env file at ${DEV_ENV}`);
    const rawLocalEnv = cmd('npx supabase status -o json', true).stdout;
    if (typeof rawLocalEnv !== 'string') {
        console.error('Could not start supabase locally. Make sure Docker Desktop is running on your machine.')
        return;
    }
    const jsonLocalEnv = JSON.parse(rawLocalEnv);
    jsonLocalEnv.PUBLIC_SUPABASE_API_KEY = jsonLocalEnv.ANON_KEY;
    jsonLocalEnv.PUBLIC_SUPABASE_URL = jsonLocalEnv.API_URL;
    delete jsonLocalEnv.ANON_KEY;
    delete jsonLocalEnv.API_URL;
    writeJsonToEnv(jsonLocalEnv, DEV_ENV);

    const useDefaults = !process.argv.includes('--no-defaults');
    const noRestore = process.argv.includes('--no-restore');
    if (!noRestore && existsSync(SNAPLET_SNAPSHOT_DIR)) {
        const mostRecentSnapshot = readdirSync(SNAPLET_SNAPSHOT_DIR)
            .map(file => path.join(SNAPLET_SNAPSHOT_DIR, file))
            .sort((file1, file2) => {
                if (statSync(file1).birthtime < statSync(file2).birthtime) {
                    //file1 is older than file2, choose file2 over it
                    return 1;
                }
                return -1;
            })[0];
        if (mostRecentSnapshot) {
            console.log(`Restoring local database using most recent snapshot at '${mostRecentSnapshot}'...`);
            if (!cmd(`npx snaplet snapshot restore --no-reset "${mostRecentSnapshot}"`).ok) {
                console.error(`\nCould not restore local database using snapshot at ${mostRecentSnapshot}`);
                return;
            }
        }
        else {
            console.warn('No snapshot found, skipping local database restoration...');
        }
    }

    //Snaplet does not include permissions or roles in dump
    console.log('Restoring local database permissions...');
    if (!cmd('psql --file=./supabase/permissions.sql postgresql://postgres:postgres@localhost:54322/postgres ').ok) {
        console.error('\nCould not restore local database permissions');
        return;
    }

    if (process.argv.includes('--pull-prod-env')) {
        console.log('Logging into supabase CLI...');
        //either path to access token or access token itself or just --login
        let accessToken = process.argv.find(entry => entry.startsWith('--login'))?.substring('--login='.length);
        if (!accessToken || !cmd(`npx supabase login << '${accessToken}'\n`).ok) {
            accessToken = await asyncGetSupabaseAccessToken();
        }

        const SUPABASE_PROJECT_ID = await asyncGetSupabaseProjectRef();
        const DB_HOSTNAME = `db.${SUPABASE_PROJECT_ID}.supabase.co`;
        const DB_PORT = 5432;
        const DB_NAME = 'postgres';
        //Get production database credentials
        const dbConnection = await addPgpassEntry(DB_HOSTNAME, DB_PORT, DB_NAME, useDefaults);

        //Use credentials to download production envrionment variables
        const psql = `${dbConnection.psql()} -c "COPY (SELECT ROW_TO_JSON(env) FROM contak.environment() AS env) TO STDOUT"`;
        console.log(`Pulling environment variables from ${dbConnection.url()}`);
        const rawJson = cmd(psql, true).stdout;
        if (typeof rawJson === 'string') {
            writeJsonToEnv(JSON.parse(rawJson), PROD_ENV);
        } else {
            console.error(`Error retrieving contak.environment().\n Try adding ${dbConnection.hostname} to hosts file at C:\\Windows\\System32\\drivers\\etc.\n Aborting...`);
            return;
        }
        restrictAccess(PROD_ENV);
    }

    const gpu_name = cmd(`nvidia-smi --query-gpu name --format=csv,noheader`, true).stdout;
    const env = { DEVICE: 'cpu' };
    if (gpu_name) {
        console.log(`Found gpu ${gpu_name}`);
        env.DEVICE = 'gpu';
    } else {
        console.log('No NVIDIA GPU found, building for CPU...');
        console.log('If host has a NVIDIA GPU, install the NVIDIA Container Toolkit to use it in docker.')
    }
    // NOTE: docker command errors when passed a custom env from node, use explicit steps...
    const dockerCompose = `docker compose -f docker-compose.yml -f docker-compose.debug.yml`;
    if (!cmd(`${dockerCompose} build --build-arg DEVICE=${env.DEVICE}`).ok) {
        console.error('\nCould not build AI service');
        return;
    }
    if (!cmd(`${dockerCompose} create --no-build`).ok) {
        console.error(`\nCould not create AI Service containers`);
        return;
    }
    if (!cmd(`${dockerCompose} start`).ok) {
        console.error(`\nCould not start AI Service`);
    }

    // NOTE: selfHost must run in its own process
    const selfHost = fork('./tools/selfHost.js', ['--local']);
    await new Promise((resolve, reject) => {
        selfHost.on('message', message => {
            if (message.type == 'START') {
                resolve(message.data);
            }
        })

        selfHost.on('error', (code) => {
            reject(code);
        })
    });

    await sleep(100);

    console.log('supabase local server:');
    console.log(rawLocalEnv);
    console.log('Starting vite development server...');
    const openArg = process.argv.includes('--no-open') ? '' : '--open';
    cmd('npx vite ' + openArg);
    // await asyncSpawn('npx', ['vite', openArg]);

    const yesNo = await asyncQuestion('Do you want to stop supabase? (yes/no) ');
    if (yesNo.charAt(0).toLowerCase() === 'y') {
        console.log('Ok, stopping local supabase instance...');
        await asyncSpawn('npx', ['supabase', 'stop', '--no-backup']);
    }
    process.exit(0);
})();
