import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.PUBLIC_SUPABASE_URL, import.meta.env.PUBLIC_SUPABASE_API_KEY)

//TODO: fix this
export const toDBDate = (date) => {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    const toTwoDigit = (number) => number < 10 ? '0' + number : String(number);
    const d = date;
    const formated = `${d.getUTCFullYear()}-${toTwoDigit(d.getUTCMonth())}-${toTwoDigit(d.getUTCDate())} ${toTwoDigit(d.getUTCHours())}:${toTwoDigit(d.getUTCMinutes())}:${toTwoDigit(d.getUTCSeconds())} -${toTwoDigit(Math.round(d.getTimezoneOffset() / 60))}:00`;

    if (date instanceof Date) {
        if (isNaN(date)) {
            return 'infinity';
        }
        return formated;
    }
    console.warn('cannot create database date string from', date);
}
const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;

export const fileSizes = { KB, MB, GB };
export const toFileSize = (num_bytes, decimals = 2) => {
    if (!+num_bytes) return '0 Bytes'

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(num_bytes) / Math.log(k))

    return `${parseFloat((num_bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
