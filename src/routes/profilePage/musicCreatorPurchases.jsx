import Navbar from 'Components/navbar';
import img1 from 'Images/placeholders/1.png';
import img2 from 'Images/placeholders/2.png';
import img3 from 'Images/placeholders/3.png';
import img4 from 'Images/placeholders/4.png';
import 'Routes/default.scss';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";

export default function MusicCreatorPurchases() {
    //const params = useLoaderData();

    // https://github.com/reactivestack/cookies/tree/master/packages/react-cookie/#getting-started
    const [cookies] = useCookies(['username']); //username cookie, used for login
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.username != "musician") //user is not a music creator
        {
            navigate("/");
        }
    }, [cookies]); //execute when page loads or cookies changes

    const musicInfo = [ //hardcoded, change for later
        { id: 0, imgUrl: img1, trackName: "Track 1", numPurchases: 1513, numNewPurchases: 9 },
        { id: 1, imgUrl: img2, trackName: "Track 2", numPurchases: 24, numNewPurchases: 24 },
        { id: 2, imgUrl: img3, trackName: "Track 3", numPurchases: 999, numNewPurchases: 0 },
        { id: 3, imgUrl: img4, trackName: "Track 4", numPurchases: 6622, numNewPurchases: 777 }
    ];

    const musicList = musicInfo.map(track =>
        <div key={track.id} className="flex-column flex-center">
            <img src={track.imgUrl} style={{ width: "75%", maxWidth: "256px" }}></img>
            <p className="font-family fs-m bold">{track.trackName}</p>
            <p className="font-family fs-s">Track purchases: {track.numPurchases} <span style={{ color: ((track.numNewPurchases > 0) ? "red" : "white") }}>&#40;+{track.numNewPurchases}&#41;</span> </p>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="App-body">
                <section className='flex-center'>
                    <h1 className='font-family fs-xxl fw-800' style={{ maxWidth: 'min(100%, 900px)', textAlign: 'center' }}>
                        Music Purchase Stats
                    </h1>
                </section>
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', margin: '2em 3em', gap: '1.5em' }}>
                    {musicList}
                </section>
            </div>
        </>
    )
}