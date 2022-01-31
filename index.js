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

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().min(1).required(),
    type: joi.string().allow('message').allow('private_message').required(),
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

    if(validation.error){
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

    await db.collection("message").insertOne({
        from: participant.name, 
        to: 'Todos', 
        text: 'entra na sala...', 
        type: 'status', 
        time: dayjs().format('HH:MM:SS')});

    res.sendStatus(201);
})

server.get("/participants", async (req, res) => {
    await db.collection("participants").find().toArray().then(participants => {
        res.send(participants);
    });
})

server.post("/messages", async (req, res) => {
    const message = req.body;

    const validation = messageSchema.validate(message);

    if(validation.error){
        res.sendStatus(422)
        return;
    };

    await db.collection("message").insert({
        from: req.headers.user, 
        to: message.to, 
        text: message.text,
        type: message.type, 
        time: dayjs().format("HH:MM:SS")
    });

    res.sendStatus(201);
})

server.get("/messages", async (req, res) => {
    const limit = parseInt(req.query.limit);

    await db.collection("message").find().limit(limit).toArray().then(messages => {
        res.send(messages);
    });
})

server.post("/status", async (req, res) => {
    const user = req.headers.user;
    console.log(user)

   await db.collection("participants").findOne({name: user})
    .then((isActivate) => {
        if(!isActivate){
            res.sendStatus(404)
            return;
    }});

    await db.collection("participants").updateOne(
        {name: user},
        {$set: {lastStatus: Date.now()}});

    res.sendStatus(200);
})

server.listen(5000);