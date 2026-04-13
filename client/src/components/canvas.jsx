import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

const Canvas = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);

  const [history, setHistory] = useState([]);
  const historyRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set up line styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    setPoints(prev => [...prev, { x: offsetX, y: offsetY, timestamp: Date.now()}]);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    setPoints(prev => {
      const lastPoint = prev[prev.length - 1];
      const dist = lastPoint ? Math.sqrt((offsetX - lastPoint.x)**2 + (offsetY - lastPoint.y)**2) : 0;
      
      if (dist > 2) { // Only add if mouse moved 2+ pixels
        return [...prev, { x: offsetX, y: offsetY, timestamp: Date.now() }];
      }
      return prev;
    });
  };

  const stopDrawing = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  const saveState = () => {
    historyRef.current.push(canvasRef.current.toDataURL());
  }

  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
        const canvas = canvasRef.current;
        /** @type {CanvasRenderingContext2D} */
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setPoints([]);
    },
    getHeatmapData: () => points,
    undoState: () => {
      const canvas = canvasRef.current;
      /** @type {CanvasRenderingContext2D} */
      const ctx = canvas.getContext('2d');
      const history = historyRef.current;
      if (history.length < 2) {
        if (history.length === 1) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setHistory([]);
        }
        return;
      }

      history.pop();

      const prevState = history[history.length - 1];

      const img = new Image();
      img.src = prevState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={500}
      style={{ border: '1px solid #000', cursor: 'crosshair', backgroundColor: "white" }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={() => {
        stopDrawing();
        saveState();
      }}
      onMouseLeave={stopDrawing}
    />
  );
});

export default Canvas;