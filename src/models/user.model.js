import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema= new Schema(
    {
        username:{
            type:String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar:{
            type: String, //from cloudnary url 
            required: true
        },
        coverImage:{
            type:String, //from cloudnary url 
        },
        watchHistory:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,  //to dycrpt password string use dycrpt package
            required: [true, 'Password is required']
        },
        refreshToken:{
            type:String,
        }    
    },

    {
        timeseries:true
    }

)

// pre() read from mongoose middleware types 
// and is used for password encryption and dcryption and campare dcrypted password and plain text password  
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// compare palin text password and hashing password 
// if password match then it return true otherwise return false
userSchema.methods.isPasswordCorrect = async function(password){
    // console.log("user docs : ",this);
    // console.log("Input Password:", password);
    // console.log("Stored Hashed Password:", this.password);
    return await bcrypt.compare(password, this.password);
}



// access token 
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        // payload 
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName: this.fullName
        },
        //  , token 
        process.env.ACCESS_TOKEN_SECRET,
        
        // , {expiresIn}
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

// refresh token 

userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
    {
        id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
   ) 
}

export const User = mongoose.model("User", userSchema);