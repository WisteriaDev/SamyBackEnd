const express = require('express');
var cors = require('cors')
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
app.use(cors());

//route middlewares
app.use('/api/user', userRoutes);

app.listen(3000, () => console.log("Server up and running"));
