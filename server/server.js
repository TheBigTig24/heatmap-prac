const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const corsOptions = {
    origin: 'http://localhost:5173',
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

app.post('/upload', upload.single('screenshot'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file upload.');
    }
    console.log(req.file.path);

    const imageBuffer = req.file.buffer;
    //give to model

    const data = {
        message: "at least it sent something"
    }

    res.status(200).send(data);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});