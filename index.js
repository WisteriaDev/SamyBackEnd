const express = require('express');
var cors = require('cors')
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//import routes
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();

//conect to db
mongoose.connect(
    process.env.DB_CONNECT, 
    {useNewUrlParser: true}, 
    () => console.log('Connected to mongoDB')
);

//middleware
app.use(express.json());
app.use(cors());

//route middlewares
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);

app.listen(3000, () => console.log("Server up and running"));
