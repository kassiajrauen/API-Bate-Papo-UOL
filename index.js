import express, {json} from 'express';
import { MongoClient } from "mongodb";
import cors from 'cors';
import dotenv from "dotenv";
import joi from 'joi'
import dayjs from 'dayjs';

dotenv.config();

const userSchema = joi.object({
    name: joi.string().min(1).max(12).required(),
})

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("projeto_12_APIBatePapoUol");
});

const server = express();
server.use(json());
server.use(cors());

server.post("/participants", async (req, res) => {
    const participant = req.body;    
    
    const validation = userSchema.validate(participant);

    if(!validation){
        res.sendStatus(422)
        return;
    };
    
    await db.collection("participants").findOne({name: participant.name.toLowerCase()}).then((exist) => {
        if(exist){
            res.sendStatus(409)
            return;
        }
    });
    
    await db.collection("participants").insertOne({name: participant.name.toLowerCase(), lastStatus: Date.now()});

    await db.collection("message").insertOne({from: participant.name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:MM:SS')});

    res.sendStatus(201);
})

server.get("/participants", (req, res) => {
})

server.post("/messages", (req, res) => {

})

server.get("/messages", (req, res) => {

})

server.post("/status", (req, res) => {

})

server.listen(5000);