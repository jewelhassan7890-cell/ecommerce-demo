require('dotenv').config()
const express = require('express')



const port = process.env.PORT || 3000;
const app = require("./app");
const connectDB = require("./config/database");



connectDB();

app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`);
})         
