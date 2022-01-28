import express from 'express';
import cors from 'cors';

const server = express();
server.use(cors());

server.get("/", (req, res) => {
    res.send('Hello World');
});

server.listen(5000);