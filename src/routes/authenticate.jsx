import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '~/global';
import { useSession } from '~/hooks/useSession';

//TODO: make prettier
export default function Authenticate() {
    const navigate = useNavigate();
    const [session, loading] = useSession();

    useEffect(() => {
        if (session && !loading) {
            navigate('/albums');
        }
    }, [session]);

    return (<>
        <div className='absolute-fill flex-center'>
            <div className='bg-neutral-100 br-100' style={{ padding: '1em', minWidth: '30%' }}>
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
            </div>
        </div>
    </>)
}

