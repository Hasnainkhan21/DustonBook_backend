const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const connectDB = require('./Configurations/db');
const cors = require('cors');
const morgan = require('morgan');


connectDB();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get('/', (req, res) => {
    res.send('Hello Books!');
});
const port = process.env.PORT;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
