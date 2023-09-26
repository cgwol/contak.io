import { supabase } from "~/global";

/**
 * Custom fetch function that allows setting infinite timeout \
 * Tries to match browser fetch functionality
 * @param {string | URL} url 
 * @param {{method: ('GET'|'POST'|'PUT'|'DELETE')?, headers: Object, signal: AbortSignal, timeout: number?, responseType: ('blob'|'arraybuffer'|'text')?}} init
 * @returns {Promise<Response>} Response on success, object otherwise
 */
const asyncHttpRequest = (url, { method = 'GET', headers = {}, body = null, signal = null, timeout = 300 * 1000, responseType = 'blob' } = {}) => {
    const http = new XMLHttpRequest();
    http.open(method, url);
    for (const [key, value] of Object.entries(headers)) {
        http.setRequestHeader(key, value);
    }
    signal?.addEventListener('abort', function (e) {
        http.abort();
    }, { once: true });
    http.timeout = timeout;
    http.responseType = responseType;
    http.send(body);
    return new Promise((resolve, reject) => {
        http.onerror = function (progress) {
            reject({
                statusCode: this.status,
                message: this.statusText,
                response: this.response,
            });
        }
        http.ontimeout = function (progress) {
            reject({
                statusCode: 408,
                message: `Request for ${url} timed out after ${this.timeout / 1000} seconds`
            });
        }
        http.onabort = function (progress) {
            resolve(signal.reason);
        }
        http.onload = function (progress) {
            const rawHeaders = this.getAllResponseHeaders();
            const arr = rawHeaders.trim().split(/[\r\n]+/);
            const headers = new Headers();
            for (const line of arr) {
                const parts = line.split(": ");
                const header = parts.shift();
                const value = parts.join(": ");
                headers.set(header, value);
            }
            const response = new Response(this.response, {
                status: this.status,
                statusText: this.statusText,
                headers,
            });
            resolve(response);
        }
    });
}

class APIClent {
    /**
     * 
     * @param {string | URL} baseUrl URL of API (http://localhost:5000)
     */
    constructor(baseUrl = null) {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            // localtunnel requires user to enter host IP without this header
            "Bypass-Tunnel-Reminder": true,
        };
    }

    static async asyncGetBaseUrl(signal = null) {
        const { data, error } = await supabase.from("public_settings")
            .select("value").eq("id", "PUBLIC_API_URL")
            .abortSignal(signal).maybeSingle();
        if (error) {
            throw error;
        }
        const url = data?.value;
        if (!url) {
            throw new Error(`Site setting 'PUBLIC_API_URL' is empty`);
        }
        return url;
    }

    async musicgen(description, { signal = null } = {}) {
        if (!this.baseUrl) {
            this.baseUrl = await APIClent.asyncGetBaseUrl(signal);
        }
        const request = new URL(this.baseUrl);
        request.pathname = "/musicgen";
        request.searchParams.set("description", description);
        return await asyncHttpRequest(request, {
            signal,
            headers: this.defaultHeaders,
        });
    }

    async status({ signal = null } = {}) {
        if (!this.baseUrl) {
            this.baseUrl = await APIClent.asyncGetBaseUrl(signal);
        }
        const request = new URL(this.baseUrl);
        request.pathname = "/status";
        const response = await fetch(request, {
            signal,
            headers: {
                ...this.defaultHeaders,
            }
        });
        // const json = await response.json();
        return response;
    }
}

export const apiClient = new APIClent();