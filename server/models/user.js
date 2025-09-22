import mongoose from "mongoose";
const Userschema=new mongoose.Schema({
    username: {type:String, unique:true,required:true},
    mail:{type:String,unique:true,require:true},
    password:{type:String,required:true},
    admin:{type:Boolean,required:false,default:false},
    player:{type:Boolean,required:false,default:false}
})


const UserModel=mongoose.model("User",Userschema)
export {UserModel as User} 