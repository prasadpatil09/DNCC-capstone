import mongoose from "mongoose";

const Chatschema=new mongoose.Schema({
    username:{type:String,required:true},
    message:{type:String,required:true},
    timestamp:{type:Date,default:Date.now}
})

const Chat=mongoose.model("chat",Chatschema)

export {Chat}