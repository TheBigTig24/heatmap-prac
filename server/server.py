import tensorflow as tf
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
from datetime import datetime
from class_names import class_names

model = tf.keras.models.load_model('../models/models-3000/model_epoch_05.keras')

app = FastAPI()

origins = ['http://localhost:5174']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/predict")
def predict(screenshot: UploadFile = File(...)):
    try:
        # read buffer content
        contents = screenshot.file.read()
        with open("prev.png", "wb") as f:
            f.write(contents)
        
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # img_resized = cv2.resize(img_gray, (28, 28), interpolation=cv2.INTER_AREA)
        img_resized = resize_with_padding(img_gray, (28, 28))
        img_normalized = img_resized.astype('float32') / 255.0

        # reduce gray noise
        threshold = 0.7
        img_normalized[img_normalized < threshold] = 0.0
        img_normalized[img_normalized >= threshold] = 1.0
        
        
        print(f"Time: {datetime.now().time()}")
        # cv2.imwrite("debug_input.png", (img_normalized * 255).astype(np.uint8))
        
        img_np = np.reshape(img_normalized, (-1, 28, 28, 1))

        # debug pic
        ai_view = np.squeeze(img_np)
        ai_view_uint8 = (ai_view * 255).astype(np.uint8)
        ai_view_large = cv2.resize(ai_view_uint8, (280, 280), interpolation=cv2.INTER_NEAREST)
        cv2.imwrite("debug_input.png", ai_view_large)

        predictions = np.array(model.predict(np.array(img_np)))[0]
        result = class_names[predictions.argsort()[::-1][0]]
        
        return {"prediction": result}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def resize_with_padding(img, target_size=(28, 28)):
    h, w = img.shape[:2]
    
    # Calculate scaling factor to fit the longest side
    scale = min(target_size[0] / h, target_size[1] / w)
    new_w, new_h = int(w * scale), int(h * scale)
    
    # Resize while maintaining aspect ratio
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # Create a black canvas of the target size
    canvas = np.zeros((target_size[0], target_size[1]), dtype=np.uint8)
    
    # Center the resized image on the canvas
    x_offset = (target_size[1] - new_w) // 2
    y_offset = (target_size[0] - new_h) // 2
    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
    
    return canvas

@app.get('/')
async def baseRoute():
    return {'Message': 'Hello World!'}



