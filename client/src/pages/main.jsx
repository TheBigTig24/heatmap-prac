import { useRef, useState, useEffect, useCallback } from "react";
import Canvas from "../components/canvas.jsx";
import "../styles/main.css";
import Words from "../assets/words/words.jsx";
import * as htmlToImage from 'html-to-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser, faFire, faUndo, faArrowRight, faInfoCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import useSound from 'use-sound';
import CorrectAnswer from '../assets/sfx/correct.mp3';
import WrongAnswer from '../assets/sfx/wrong.mp3';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';


const Main = ({ onExit }) => {

    const canvasRemoteControl = useRef();
    const heatmapInstance = useRef(null);
    const heatmapContainerRef = useRef(null);
    const captureAreaRef = useRef(null);

    const [showWordScreen, setShowWordScreen] = useState(true);
    const [word, setWord] = useState('');
    const [prediction, setPrediction] = useState('');

    // sound effects
    const [playCorAns] = useSound(CorrectAnswer);
    const [playWroAns] = useSound(WrongAnswer);

    // modal
    let [isOpen, setIsOpen] = useState(false);

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
            const canvas = node?.querySelector('canvas')

            if (!node || !document.body.contains(node)) {
                console.log('node missing/detached');
                return;
            }

            if (!canvas) {
                console.log("there's no canvas dawg");
                return;
            }

            const bounds = getCanvasBounds(canvas);
            console.log(bounds);

            if (!bounds) {
                console.log("no bounds big dawg");
                return;
            }

            try {
                const blob = await htmlToImage.toBlob(node, {
                    cacheBust: true,
                    pixelRatio: 1,
                    width: bounds.w,
                    height: bounds.h,
                    style: {
                        transform: `translate(-${bounds.x}px, -${bounds.y}px)`,
                        width: `${node.offsetWidth}px`,
                        height: `${node.offsetHeight}px`,
                    }
                });

                if (!blob) {
                    console.log('no blobs');
                    return;
                }

                const formData = new FormData();
                formData.append('screenshot', blob, 'capture.png');

                // const url = 'https://code.notlaurence.org/proxy/8000/predict';
                const url = 'http://localhost:8000/predict'

                const res = await fetch(url, {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                console.log(data);
                const formatPrediction = data.prediction.replaceAll('%20', ' ');
                setPrediction(formatPrediction);
            } catch (error) {
                console.error("image failure ", error);
            }
        };

        const intervalId = setInterval(handleProcessing, 3000);

        return () => clearInterval(intervalId);
    }, [showWordScreen]);

    const getCanvasBounds = (canvas) => {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const imageData = ctx.getImageData(0, 0, width, height).data;

        let minX = width, minY = height, maxX = 0, maxY = 0;
        let found = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = imageData[(y * width + x) * 4 + 3];
                if (alpha > 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }

        return found ? { 
            x: Math.max(0, minX - 15),
            y: Math.max(0, minY - 15),
            w: (maxX - minX) + 30,
            h: (maxY - minY) + 30
        } : null;
    }

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

    /**
     * Logic for checking if prediction is correct
     */
    useEffect(() => {
        const prompt = word.toLowerCase().replace(/\s/g, '');
        const predict = prediction.toLowerCase().replace(/\s/g, '');

        if (prompt === predict) {
            playCorAns();
            handleNextWord();
        }
    }, [prediction]);

    /**
     * Handle Undo Logic
     */
    const handleUndo = () => {
        if (canvasRemoteControl.current) {
            canvasRemoteControl.current.undoState();
        }
    };

    /**
     * Handle Skipping To Next Word
     */
    const handleSkipWord = () => {
        playWroAns();
        handleNextWord();
    };

    /**
     * Function that holds logic for going to next word
     */
    const handleNextWord = () => {
        let idx = Math.floor(Math.random() * (Words.length + 1));
        while (Words[idx] == word) {
            idx = Math.floor(Math.random() * (Words.length + 1));
        }
        setWord(Words[idx]);
        setShowWordScreen(true);

        if (canvasRemoteControl.current) {
            canvasRemoteControl.current.clearCanvas();
            canvasRemoteControl.current.clearHistory();
        }
        if (heatmapInstance.current) {
            heatmapInstance.current.setData({
                max: 0,
                data: []
            });
        }
    };

    /**
     * Leave the game and reset everything
     */
    const handleLeaveGame = () => {
        handleNextWord();
        onExit();
    }

    return (<>
        <div className="main-cont">
            <div className={`show-word-screen ${showWordScreen ? 'active' : null}`}>
                <h1>Your word is:</h1>
                <h1 style={{color: "red"}}>{word}</h1>
                <button onClick={() => setShowWordScreen(false)} className="start-draw">Draw!</button>
            </div>
            <div className="main-inner-cont">
                <h1>A Quick, Draw! Clone</h1>
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
                    <button onClick={handleSkipWord}>Next Word<FontAwesomeIcon icon={faArrowRight}></FontAwesomeIcon></button>
                </div>
                <div className="info">
                    <h2>Current Word: <span>{word}</span></h2>
                    <h2>Prediction: <span>{prediction}</span></h2>
                </div>
            </div>
            <div className="modal-open">
                <button onClick={() => setIsOpen(true)}><FontAwesomeIcon className="fa-info-circle" icon={faInfoCircle}></FontAwesomeIcon></button>
            </div>
            <div className="exit-game">
                <button onClick={() => handleLeaveGame()}><FontAwesomeIcon className="fa-exit" icon={faTimesCircle}></FontAwesomeIcon></button>
            </div>
        </div>

        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="dialog">
        <div className="dialog-cont">
          <DialogPanel className="dialog-panel">
            <DialogTitle className="dialog-title">What is this?</DialogTitle>
            <Description className="dialog-desc">
                A recreation of the Google Quick, Draw! web game where we trained a 
                Machine Learning Model based on the Google Quick, Draw! dataset in an attempt 
                to recreate it with lower-end budget and resources.
            </Description>
            <button className="dialog-exit" onClick={() => setIsOpen(false)}>X</button>
          </DialogPanel>
          
        </div>
      </Dialog>
    </>)
};

export default Main;