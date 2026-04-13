import { useRef, useState, useEffect, useCallback } from "react";
import Canvas from "../components/canvas.jsx";
import "../styles/main.css";
import Words from "../assets/words/words.jsx";
import * as htmlToImage from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faFire, faUndo } from '@fortawesome/free-solid-svg-icons';

const Main = () => {

    const canvasRemoteControl = useRef();
    const heatmapInstance = useRef(null);
    const heatmapContainerRef = useRef(null);
    const captureAreaRef = useRef(null);

    const [showWordScreen, setShowWordScreen] = useState(true);
    const [word, setWord] = useState('');
    const [prediction, setPrediction] = useState('');

    useEffect(() => {
        let idx = Math.floor(Math.random() * (Words.length + 1));
        setWord(Words[idx]);

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

    useEffect(() => {
        const handleProcessing = async () => {
            const node = captureAreaRef.current;

            if (!node || !document.body.contains(node)) {
                console.log('node missing/detached');
                return;
            }

            try {
                const blob = await htmlToImage.toBlob(node, {
                    cacheBust: true,
                    skipAutoScale: true,
                    pixelRatio: 1,
                });

                if (!blob) {
                    console.log('no blobs');
                    return;
                }

                const formData = new FormData();
                formData.append('screenshot', blob, 'capture.png');

                const res = await fetch('https://code.notlaurence.org/proxy/8000/predict', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                console.log(data);
                setPrediction(data.prediction);
            } catch (error) {
                console.error("image failure ", error);
            }
        };

        const intervalId = setInterval(handleProcessing, 3000);

        return () => clearInterval(intervalId);
    }, [showWordScreen]);

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

    const handleSubmit = () => {
        // show to model

        // show next word
        let idx = Math.floor(Math.random() * (Words.length + 1));
        while (Words[idx] == word) {
            idx = Math.floor(Math.random() * (Words.length + 1));
        }
        setWord(Words[idx]);
        setShowWordScreen(true);

    }

    useEffect(() => {
        const prompt = word.toLowerCase().replace(/\s/g, '');
        const predict = prediction.toLowerCase().replace(/\s/g, '');

        if (prompt === predict) {
            // get next word
            let idx = Math.floor(Math.random() * (Words.length + 1));
            while (Words[idx] == word) {
                idx = Math.floor(Math.random() * (Words.length + 1));
            }
            setWord(Words[idx]);
            setShowWordScreen(true);

            // clear canvas and heatmap
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
    }, [prediction]);

    /**
     * Handle Undo Logic
     */
    const handleUndo = () => {
        if (canvasRemoteControl.current) {
            canvasRemoteControl.current.undoState();
        }
    }

    return (<>
        <div className="main-cont">
            <div className={`show-word-screen ${showWordScreen ? 'active' : null}`}>
                <h1>Your word is:</h1>
                <h1 style={{color: "red"}}>{word}</h1>
                <button onClick={() => setShowWordScreen(false)} className="start-draw">Draw!</button>
            </div>
            <div className="main-inner-cont">
                <h1>Google QuickDraw Clone</h1>
                <div className="interactables-cont">
                    <div ref={captureAreaRef}>
                        <Canvas ref={canvasRemoteControl}/>
                    </div>
                    <div ref={heatmapContainerRef} className="heatmap">

                    </div>
                </div>
                <div className="button-cont">
                    <button onClick={handleClearReq}>Clear<FontAwesomeIcon icon={faEraser}></FontAwesomeIcon></button>
                    <button onClick={handleUndo}>Undo<FontAwesomeIcon icon={faUndo}></FontAwesomeIcon></button>
                    <button onClick={updateHeatmap}>Update Heatmap<FontAwesomeIcon icon={faFire}></FontAwesomeIcon></button>
                </div>
                <div>
                    <h2>Prediction: <span>{prediction}</span></h2>
                </div>
            </div>
        </div>
    </>)
};

export default Main;