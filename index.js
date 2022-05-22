const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//import routes
const userRoutes = require('./routes/userRoutes');

dotenv.config();

//conect to db
mongoose.connect(
    process.env.DB_CONNECT, 
    {useNewUrlParser: true}, 
    () => console.log('connected to mongoDB')
);

//middleware
app.use(express.json());

//route middlewares
app.use('/api/user', userRoutes);

app.listen(3000, () => console.log("Server up and running"));
