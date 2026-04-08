const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.send('bruh');
});

app.post('/upload', upload.single('screenshot'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file upload.');
    }

    const imageBuffer = req.file.buffer;
    res.status(200).send(imageBuffer);
    //give to model

    res.status(200).send('Model processing...');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});