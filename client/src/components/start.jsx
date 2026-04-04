import { useState, useEffect } from "react";
import "../styles/start.css";

const Start = () => {

    const [screenUp, setScreenUp] = useState(false);
    
    useEffect(() => {
        console.log(screenUp);
    }, [screenUp]);
    
    return(<>
        <div className={`start-screen ${screenUp ? 'active' : ''}`}>
            <h2>DSAI and CSS presents</h2>
            <h1>A Google Quick, Draw! Clone</h1>
            <button onClick={() => setScreenUp(!screenUp)}>Start!</button>
        </div>
    </>);
};

export default Start;