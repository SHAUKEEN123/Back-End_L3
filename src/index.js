// frist approch to connect db 

// import mongoose from "mongoose";
// import {DB_NAME} from "./constants";
// import express from "express";
// const app = express()

// //data base always stay in anther continent so we use async awite
// (async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//  // ager data base ke sath talk nahi kar pa rahe hai 
//         app.on("error related to app in index.js", (error)=>{
//             console.log("error",error);
//             throw error
//         })
// // or ager data base ke sath talk kar pa rahe to ye 
//         app.listen(process.env.PORT, ()=>{
//             console.log(`App is listening  on port ${process.env.PORT}`)
//         })

//         //ager data base se connect hi ho pa rahe hai to error show kara dijiye
//     } catch (error) {
//         console.log("Error in try block of index.js file of src",error);
//         throw error;
//     }
// })();

// second approch to connect db 

// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:'./env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000, ()=>{
        console.log(`\n⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGO db connection failed !!! ", error);
})
