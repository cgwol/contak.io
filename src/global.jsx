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

