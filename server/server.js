const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://https://code.notlaurence.org/',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

// app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `draw-${Date.now()}.png`);
    }
});

const upload = multer({ storage: multer.memoryStorage() });
// const upload = multer({ storage: storage});

app.get('/', (req, res) => {
    res.send('bruh');
});

app.post('/upload', upload.single('screenshot'), async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).send('No file upload.');
        }
        
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: 'canvas.png',
            contentType: 'image/png',
        });

        const fastApiRes = await axios.post("https://code.notlaurence.org/proxy/8000/predict", form, {
            headers: form.getHeaders()
        });

        res.json({
            message: "Success",
            prediction: fastApiRes.data
        });
    } catch (error) {
        console.error("error here:", error);
        res.status(500).json({ error: error });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});