
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAudio } from "~/hooks/useAudio";

export const PlaylistTrack = ({ track }) => {
    const { track_name, track_creators, signedUrl } = track;
    const { audio, isPlaying } = useAudio(signedUrl, {});
    // const { audio, isPlaying } = useRefreshableAudio(audio_files[0], {});
    return (<div className="grid" style={{ gridTemplateColumns: '1fr 1fr 2fr', columnGap: '1em' }}>
        <button onClick={() => isPlaying ? audio.pause() : audio.play()}
            disabled={!signedUrl}>{
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />}</button>
        <p>{track_name}</p>
        <p>{track_creators?.map(creator =>
            `${creator.first_name} ${creator.last_name}`).join(', ')}</p>
    </div>)
}
