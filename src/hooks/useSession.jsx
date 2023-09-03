import { useEffect, useState } from "react";
import { supabase } from "~/global";

/**
 * Listens for changes to current supabase database session
 * @returns {[import("@supabase/supabase-js").Session, boolean]} First value is session object from auth, second value is true while loading and false otherwise
 */
export const useSession = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session)
            }
        }).finally(() => setLoading(false))

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        })

        return () => subscription.unsubscribe()
    }, []);

    return [session, loading];
}