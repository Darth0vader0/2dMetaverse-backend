const express = require('express');
const app = express();
const {registerUser, loginUser} = require('./src/controllers/auth.controller');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv'); 
const http = require("http");
dotenv.config();
const cors = require('cors');

const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
      origin: '*', 
      methods: ["GET", "POST"],
      credentials: true
    }
  });
const gameSocket = require('./src/config/gameSocket');
gameSocket(io);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
connectDB();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.post('/register', registerUser);
app.post('/login', loginUser);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
