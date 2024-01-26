const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const muler = require('muler');
const path = require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors());

//database Connection with MongooDB
mongoose.connect("mongodb+srv://ttan95044:Tranduytan240701@cluster0.uomineg.mongodb.net/BIO-FOOD");
