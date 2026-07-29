const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Todo = require('./models/Todo.js');
const User = require('./models/User.js');
const cors = require('cors');
app.use(cors());
const authenticateToken = require('./middleware/auth.js');

const PORT = 3000;
require('dotenv').config();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "Todo API is running" });
});
const url = `http://localhost:${PORT}`;

app.post("/signup", async (req,res)=>{
    try{
        const {email,password} = req.body;
        const hash = await bcrypt.hash(password,10);

        const newUser = new User({
            email:email,
            password: hash
        });

        await newUser.save();
        res.status(201).json({newUser:"successful"});

    }catch(error){
        res.status(400).json({error:error.message});
    }
});

app.post("/login", async (req,res)=>{
    try{
        //take out the info of the users 
        const {email,password} = req.body;

        //find if the user exists 
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: 'Invlid email or password'});

        }
        //compare if the password matches 
        const isMatch = await bcrypt.compare(password, user.password );
        if(!isMatch){
            //400 Bad request if password  does not match
            return res.status(400).json({error:'Invalid email or password'});
        };

        const token = jwt.sign(
            {userId: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.status(200).json({
            message:'login successful!',
            token: token
        });
    }
    catch (error){
        res.status(500).json({error: error.message});
    }


});

app.post("/todos", authenticateToken, async (req, res) => {
    try {
        const newTodo = new Todo({
            title: req.body.title,
            userId: req.user.userId
        });
        const done = await newTodo.save();
        res.status(201).json(done);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/todos",authenticateToken, async (req,res)=>{
    try{
        const todos = await Todo.find({userId: req.user.userId});
        res.status(200).json(todos);

    }catch(error){

        res.status(400).json({error: error.message});

    }
})

app.get("/todos/:id",authenticateToken, async (req,res)=>{
    try{
        const {id} = req.params;
        const todo = await Todo.findOne({ _id: id, userId: req.user.userId });
        if(!todo){
            return res.status(404).json({"error": "TODO not found ! Alas"})
        }
        res.status(200).json(todo);
    }
    catch(error){

        res.status(400).json({error: error.message});

    }
})

app.put("/todos/:id",authenticateToken, async (req,res)=>{
    try{
        const {id} = req.params;
        const todo = await Todo.findOneAndUpdate(
    { _id: id, userId: req.user.userId },
    req.body,
    { new: true }
);

        if(!todo) {
            return res.status(404).json({error: "TODO not found"});
        }

        res.status(200).json(todo);
    }
    catch (error){
        res.status(400).json({error : error.message});
    }
})
app.delete("/todos/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!todo) {
            return res.status(404).json({ error: "TODO not found" });
        }
        res.status(200).json(todo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
}

// Ensure DB is connected before handling any request
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        app.listen(PORT, () => console.log("APP RUNNING", url));
    });
}