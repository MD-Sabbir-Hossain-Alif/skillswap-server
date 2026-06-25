// dns server for mongodb connection
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS

const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.SERVER_PORT
const uri = process.env.MONGODB_URI

app.use(cors())
app.use(express.json())



app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const db = client.db("skillswap");
        const tasksCollection = db.collection("tasks");
        const freelancersCollection = db.collection("freelancers");

        //Task related APIs
        app.post('/api/tasks', async (req, res) => {
            const task = req.body;
            console.log(task);
            const newTask = {
                ...task,
                createdAt: new Date()
            }
            const result = await tasksCollection.insertOne(newTask);
            res.send(result)
        });

        app.get('/api/tasks', async (req, res) => {
            const result = await tasksCollection.find().toArray();
            res.send(result);
        });

        app.get('/api/client/tasks/:id', async (req, res) => {
            const query = { userId: req.params.id };
            const result = await tasksCollection.find(query).toArray();
            res.send(result);
        });

        app.get('/api/tasks/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            console.log(id);
            const result = await tasksCollection.findOne(id)
            res.send(result);
        });

        // freelancer related APIs
        app.post('/api/freelancers', async (req, res) => {
            const freelancer = req.body;
            console.log(freelancer);
            const newFreelancer = {
                ...freelancer,
                createdAt: new Date()
            }
            const result = await freelancersCollection.insertOne(newFreelancer);
            res.send(result);
        });

        app.get('/api/freelancers', async (req, res) => {
            const result = await freelancersCollection.find().toArray();
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})