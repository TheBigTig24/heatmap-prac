## Starting Python Server

~ cd model_server/
~ uvicorn server:app --reload

## Starting React Client

~ cd heatmap-prac/client/
~ npm run start

Should be located at https://code.notlaurence.org/proxy/5174/

## Viewing Debug Images

In the model_server directory, there should be two images, prev.png and debug_input.png, where prev is the raw image from the frontend and debug_input is what the model sees