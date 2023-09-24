#!/usr/bin/env node
import localtunnel from 'localtunnel';
import { cmd } from "./os.js";
import { addPgpassEntry, localDbConnection } from "./pgpass.js";

(async function Main() {
    const isLocal = process.argv.includes('--local');
    //Get production database credentials
    const DB_HOSTNAME = `db.ontjcsevddaxmnnzjfqb.supabase.co`;
    const DB_PORT = 5432;
    const DB_NAME = 'postgres';
    const dbConnection = isLocal ? localDbConnection :
        await addPgpassEntry(DB_HOSTNAME, DB_PORT, DB_NAME);

    const port = 5000;
    const tunnel = await localtunnel({ port });
    // the assigned public url for your tunnel
    // i.e. https://abcdefgjhij.localtunnel.me
    const PUBLIC_API_URL = tunnel.url;

    console.log(`Setting PUBLIC_API_URL to ${PUBLIC_API_URL} at ${dbConnection.url()}`);
    if (!cmd(`psql -c "INSERT INTO public.public_settings (id, value) VALUES ('PUBLIC_API_URL', '${PUBLIC_API_URL}') ON CONFLICT (id) DO UPDATE SET value = '${PUBLIC_API_URL}'" ${dbConnection.url(true)}`)) {
        console.error(`Could not set PUBLIC_API_URL to remote ai-service url ${PUBLIC_API_URL}`);
        return;
    }
    ['beforeExit', 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM']
        .forEach(signal => process.once(signal, () => {
            tunnel.close();
            process.exit(0);
        }));
    tunnel.on('close', () => {
        console.log('Clearing PUBLIC_API_URL...');
        if (!cmd(`psql -c "UPDATE public.public_settings SET value = NULL WHERE id = 'PUBLIC_API_URL'" ${dbConnection.url(true)}`)) {
            console.error(`Could not unset PUBLIC_API_URL at ${dbConnection.url()}`);
        }
    });
    // tunnel.on('request', function (e) {
    //     console.log(`received request `, arguments);
    // })

    console.log(`Exposing http://localhost:${port} to internet through \x1b[32m${PUBLIC_API_URL}\x1b[0m`);
    if (typeof process.send === 'function') {
        process.send({ type: 'START', data: PUBLIC_API_URL });
    }
})();