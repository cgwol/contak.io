import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "~/global";

//TODO: Lazily load audio only when user plays the track
export const useAudio = (src, { volume = 1, playbackRate = 1, autoPlay = false }) => {
    const [playing, setPlaying] = useState(autoPlay);
    const audio = useMemo(() => new Audio(src), [src]);
    const canPlay = useRef(false);

    const play = () => {
        if (canPlay.current) {
            audio.play();
            return;
        }
        audio.src = src;
        audio.addEventListener('canplay', () => audio.play(), { once: true });
    }

    useEffect(() => {
        audio.volume = volume;
    }, [volume, audio])

    useEffect(() => {
        audio.playbackRate = playbackRate;
    }, [playbackRate, audio])

    useEffect(() => {
        if (autoPlay) {
            audio.play();
        }
        function applyAudioPaused() {
            setPlaying(!this.paused && !this.ended);
        }
        function setCanPlayFalse() {
            canPlay.current = false;
        }
        function setCanPlayTrue() {
            canPlay.current = true;
        }

        audio.addEventListener('play', applyAudioPaused);
        audio.addEventListener('pause', applyAudioPaused);
        audio.addEventListener('ended', applyAudioPaused);
        audio.addEventListener('loadstart', setCanPlayFalse);
        audio.addEventListener('canplay', setCanPlayTrue);
        return () => {
            audio.removeEventListener('play', applyAudioPaused);
            audio.removeEventListener('pause', applyAudioPaused);
            audio.removeEventListener('ended', applyAudioPaused);
            audio.removeEventListener('loadstart', setCanPlayFalse);
            audio.removeEventListener('canplay', setCanPlayTrue);
        };
    }, [audio]);

    return { audio, isPlaying: playing, play };
}


export const useRefreshableAudio = (virtualPath, audioOptions) => {
    const [src, setSrc] = useState('');
    const { audio, isPlaying } = useAudio(src, audioOptions ?? {});
    const deferredPath = useDeferredValue(virtualPath);

    async function tryGetSignedUrl(e) {
        const { data, error } = await supabase.storage.from('tracks')
            .createSignedUrl(virtualPath, 20);
        if (error) {
            throw error;
        }
        setSrc(data.signedUrl);
    }
    useEffect(() => {
        tryGetSignedUrl();
    }, [virtualPath]);


    useEffect(() => {
        audio.addEventListener('error', tryGetSignedUrl);
        return () => audio.removeEventListener('error', tryGetSignedUrl);
    }, [audio]);
    return { audio, isPlaying };
}