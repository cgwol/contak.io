import { supabase } from "~/global";

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
            // "Access-Control-Allow-Origin": "*",
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
        const doFetch = () => {
            return fetch(request, {
                signal,
                headers: {
                    ...this.defaultHeaders,
                }
            });
        }
        try {
            return await doFetch();
        } catch (error) {
            if (error instanceof TypeError) {
                Promise.reject({
                    level: 'warn',
                    message: 'Request is taking longer than usual, retrying...'
                });
                return await doFetch();
            }
            throw error;
        }
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