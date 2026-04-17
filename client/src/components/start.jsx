import { useState, useEffect } from "react";
import "../styles/start.css";
import DSAI from "../assets/logos/cpp_ds_ai_logo.png";
import CSS from "../assets/logos/cpp_css_logo.png";

const Start = ({ displayValue, onStartBtn }) => {

    return(<>
        <div className={`start-screen ${displayValue ? 'active' : ''}`}>
            <div className="dsai start-side">
                <div className="right-side">
                    <img src={DSAI}></img>
                    <h1>A Google Quick, Draw! Clone</h1>
                </div>
                <div className="left-side">
                    
                </div> 
            </div>
            <div className="css start-side">
                <div className="left-side"></div>
                <div className="right-side">
                    <img src={CSS}></img>
                    <h1>Presented by DSAI and CSS</h1>
                </div>
            </div>
            <button onClick={() => onStartBtn()}>Start!</button>
        </div>
    </>);
};

export default Start;