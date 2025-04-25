const express = require('express');
const app = express();
const {registerUser, loginUser} = require('./src/controllers/auth.controller');
const connectDB = require('./src/config/db');
const dotenv = require('dotenv');       
dotenv.config();
const cors = require('cors');



app.use(express.json());
connectDB();
app.use(cors({
    origin: '*', // Replace with your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

app.post('/register', registerUser);
app.post('/login', loginUser);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}
);
