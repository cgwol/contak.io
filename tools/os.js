import { execSync, spawn } from 'child_process';
import readline from 'node:readline';

export const isWindows = process.platform === "win32";
const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
/**
 * 
 * @param {string} question 
 * @returns {Promise<string>}
 */
export const asyncQuestion = question => new Promise((resolve) => prompt.question(question, resolve));

/**
 * 
 * @param {string} question 
 * @returns 
 */
export const asyncNonEmptyQuestion = async (question) => {
    let answer = '';
    do {
        answer = (await asyncQuestion(question)).trim();
    } while (!answer)
    return answer;
}

/**
 * 
 * @param {string} command 
 * @param {boolean} redirectOutput true if using stdout from process and want no output shown, false to show all output but leave stdout out of return value (dont pipe to js)
 * @returns ok if exited with exit code = 0, otherwise returns ok = false with error
 */
export const cmd = (command, redirectOutput = false) => {
    try {
        const stdout = execSync(command, { stdio: redirectOutput ? 'pipe' : 'inherit', encoding: redirectOutput ? 'utf-8' : undefined });
        return { ok: true, stdout };
    } catch (error) {
        if (!redirectOutput) {
            process.stderr.write(error.toString());
        }
        return { ok: false, error };
    }
}

/**
 * 
 * @param {string} command 
 * @param {string[]} args 
 * @param {boolean} isQuiet 
 * @returns 
 */
export const asyncSpawn = (command, args, isQuiet = false) => {
    const proc = spawn(command, args, { stdio: isQuiet ? 'ignore' : 'inherit' });
    return new Promise((resolve, reject) => {
        proc.on('close', resolve);
        proc.on('error', reject);
    });
}

/**
 * Restricts access to the current user
 * @param {import('fs').PathOrFileDescriptor} path 
 * @returns 
 */
export const restrictAccess = (path) => {
    if (isWindows) {
        return cmd(`icacls "${path}" /grant:r ${process.env.USERNAME}:f /inheritance:r`).ok;
    }
    return cmd(`chmod 0600 '${path}'`).ok;
}


export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));