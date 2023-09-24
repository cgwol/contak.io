import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { asyncQuestion, isWindows, restrictAccess } from './os.js';

class PgpassEntry {
    /**
     * 
     * @param {string} hostname 
     * @param {string|number} port 
     * @param {string} database 
     * @param {string} username 
     * @param {string} password 
     */
    constructor(hostname, port, database, username, password) {
        this.hostname = hostname;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
    }
    raw(showPassword = false) {
        return `${this.hostname}:${this.port}:${this.database}:${this.username}:${showPassword ? this.password : ''}`;
    }
    /**
     * Format = postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
     * @param {boolean} showPassword 
     * @returns 
    */
    url(showPassword = false) {
        return `postgresql://${this.username ? `${this.username}${showPassword ? `:${encodeURIComponent(this.password)}` : ''}@` : ''}${this.hostname}${this.port ? `:${this.port}` : ''}${this.database ? `/${this.database}` : ''}`;
    }
    psql(showPassword = false) {
        return `psql ${showPassword ? `'${this.url(showPassword)}'` : `-h ${this.hostname} -p ${this.port} -d ${this.database} -U ${this.username}`}`;
    }
    toString(showPassword = false) {
        return this.psql(showPassword);
    }
}

export const localDbConnection = new PgpassEntry('localhost', '54322', 'postgres', 'postgres', 'postgres');

/**
 * pgpass Grammar: hostname:port:database:username:password separated by newlines (\n or \r\n).
 * Keeps empty lines
 * @param {import('fs').PathOrFileDescriptor} path 
 * @returns 
 */
const parsePgpass = (path) => readFileSync(path, 'utf-8').split('\n').map(row => {
    let [hostname, port, database, username, password] = row.split(':');
    if (password?.endsWith('\r')) {
        password = password.substring(0, password.length - 1);
    }
    return new PgpassEntry(hostname, port, database, username, password);
});

/**
 * 
 * @param {import('fs').PathOrFileDescriptor} path 
 * @param {ReturnType<typeof parsePgpass>} pgpass 
 */
const writePgpass = (path, pgpass) => {
    let data = '';
    for (const entry of pgpass) {
        data += `${entry.raw(true)}${os.EOL}`;
    }
    writeFileSync(path, data);
}

/**
 * 
 * @param {ReturnType<typeof parsePgpass>} pgpass 
 * @param {string} hostname 
 * @param {string|number} port 
 * @param {string} database 
 * @param {string|null} username 
 * @returns 
 */
const searchPgpass = (pgpass, hostname, port, database, username = null) => {
    return pgpass.filter(({ hostname: h, port: p, database: d, username: u }) =>
        hostname === h && port == p && database === d && (username == null || username === u));
}

/**
 * Searches local machine for pgpass file and creates it if not exists.
 * Windows: %APPDATA%\postgresql\pgpass.conf
 * Other: ~/.pgpass
 * @returns 
 */
const findPgpass = () => {
    if (isWindows) {
        const pgpassDir = path.join(process.env.APPDATA, 'postgresql');
        const pgpassPath = path.join(pgpassDir, 'pgpass.conf');
        if (!existsSync(pgpassDir)) {
            mkdirSync(pgpassDir);
            writeFileSync(pgpassPath, '');
            return { path: pgpassPath, pgpass: [] };
        }
        else if (!existsSync(pgpassPath)) {
            writeFileSync(pgpassPath, '');
            return { path: pgpassPath, pgpass: [] };
        }
        return { path: pgpassPath, pgpass: parsePgpass(pgpassPath) };
    }
    const pgpassPath = path.join(process.env.HOME, '.pgpass');
    if (!existsSync(pgpassPath)) {
        writeFileSync(pgpassPath, '');
        restrictAccess(pgpassPath);
        return { path: pgpassPath, pgpass: [] };
    }
    restrictAccess(pgpassPath);
    return { path: pgpassPath, pgpass: parsePgpass(pgpassPath) };
}

const asyncGetUsername = async (databaseEntries, useDefault = false) => {
    if (!databaseEntries.length) {
        return (await asyncQuestion("Enter your database username: ")).trim();
    }
    const usernames = databaseEntries.map(({ username }) => username);
    if (usernames.length === 1 || useDefault) {
        return usernames[0];
    }
    else {
        const question = `Choose database username:\n${usernames.map(u => '   ' + u).join('\n')}`;
        let username = '';
        do {
            username = (await asyncQuestion(question)).trim();
        } while (!usernames.includes(username));
        return username;
    }
}


/**
 * 
 * @param {ReturnType<typeof parsePgpass>[0]} pgpass1 
 * @param {ReturnType<typeof parsePgpass>[0]} pgpass2 
 * @returns 
 */
export const pgpassEqual = (pgpass1, pgpass2) => pgpass1 === pgpass2 ||
    Object.entries(pgpass1).every(([key, value]) => typeof value !== 'string' || pgpass2?.[key] === value);

export const addPgpassEntry = async (hostname = '', port = '', database = '', useDefaults = true) => {
    let { path, pgpass } = findPgpass();
    const newEntry = new PgpassEntry(
        //hostname: 
        (!hostname && (await asyncQuestion(`Enter database hostname or press enter to skip (default = ${hostname}): `)).trim()) || hostname,
        //port: 
        (!port && (await asyncQuestion(`Enter database port or press enter to skip (default = ${port}): `)).trim()) || port,
        //database: 
        (!database && (await asyncQuestion(`Enter database or press enter to skip (default = ${database}): `)).trim()) || database,
        // username: '', password: ''
        '', ''
    );

    const databaseEntries = searchPgpass(pgpass, newEntry.hostname, newEntry.port, newEntry.database);
    newEntry.username = await asyncGetUsername(databaseEntries, useDefaults);

    const userEntries = databaseEntries.filter(({ username }) => newEntry.username === username);
    if (userEntries.length > 1) {
        const isYes = useDefaults || (await asyncQuestion(`Multiple entries found for ${newEntry}. Do you want to remove the extra entries?`)).trim().charAt(0).toLowerCase() === 'y';
        if (isYes) {
            pgpass = pgpass.filter(entry => !userEntries.some(e => pgpassEqual(entry, e)));
            pgpass.push(userEntries[0]);
        }
    }
    if (userEntries.length && userEntries[0].password) {
        const isYes = useDefaults || (await asyncQuestion(`Entry already exists, do you want to update the password for ${newEntry}`)).trim().charAt(0).toLowerCase() === 'y';
        if (!isYes)
            return userEntries[0];
    }

    newEntry.password = (useDefaults && userEntries[0].password) || await asyncNonEmptyQuestion(`Enter password for '${newEntry}': `);

    if (userEntries.length) {
        if (userEntries.some(({ password }) => newEntry.password === password)) {
            if (!useDefaults)
                console.warn('Password already exists for user. Aborting...');
            return userEntries[0];
        }
        userEntries[0].password = newEntry.password; // indirectly updates object in `pgpass`
    } else {
        pgpass.push(newEntry);
    }

    writePgpass(path, pgpass);
    console.log(`Wrote new pgpass entry '${newEntry.raw()}' to ${path}`);
    return newEntry;
}