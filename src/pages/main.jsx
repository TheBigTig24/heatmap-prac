import { useRef, useState, useEffect } from "react";
import Canvas from "../components/canvas";
import "../styles/main.css";

const Main = () => {

    const canvasRemoteControl = useRef();
    const heatmapInstance = useRef(null);
    const heatmapContainerRef = useRef(null);

    const [showWordScreen, setShowWordScreen] = useState(true);
    const [word, setWord] = useState('stuff');

    useEffect(() => {
        if (window.h337) {
            heatmapInstance.current = h337.create({
                container: heatmapContainerRef.current,
                radius: 30,
                maxOpacity: 0.6,
                minOpacity: 0,
                blur: 0.75,
                max: 20,
            })
        }
    }, []);

    const handleClearReq = () => {
        if (canvasRemoteControl.current) {
            canvasRemoteControl.current.clearCanvas();
        }
        if (heatmapInstance.current) {
            heatmapInstance.current.setData({
                max: 0,
                data: []
            });
        }
    }

    const updateHeatmap = () => {
        /** @type {Array} */
        const data = getHeatmapData();
        console.log(data);
        data.forEach((element) => {
            if (heatmapInstance.current) {
                heatmapInstance.current.addData({
                    x: element.x,
                    y: element.y,
                    value: 1
                });
            }
        });
    }

    const getHeatmapData = () => {
        if (canvasRemoteControl.current) {
            return canvasRemoteControl.current.getHeatmapData();
        }
        return [];
    }

    return (<>
        <div className="main-cont">
            <div className={`show-word-screen ${showWordScreen ? 'active' : null}`}>
                <h1>Your word is:</h1>
                <h1>{word}</h1>
                <button onClick={() => setShowWordScreen(!setShowWordScreen)} className="start-draw">Draw!</button>
            </div>
            <div className="main-inner-cont">
                <h1>Google QuickDraw Clone</h1>
                <div className="interactables-cont">
                    <Canvas ref={canvasRemoteControl}/>
                    <div ref={heatmapContainerRef} className="heatmap">

                    </div>
                </div>
                <div className="button-cont">
                    <button onClick={handleClearReq}>Clear<i className="fa-solid fa-eraser"></i></button>
                    <button>Submit</button>
                    <button onClick={updateHeatmap}>Update Heatmap<i className="fa-solid fa-fire"></i></button>
                </div>
            </div>
        </div>
    </>)
};

export default Main;