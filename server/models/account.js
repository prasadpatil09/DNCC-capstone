import mongoose from "mongoose";

const Accountschema=new mongoose.Schema({
    type:{type:String,required:true},
    paidby:{type:String,required:true},
    amount:{type:Number,required:true},
    moneyinfo:{type:String,required:true},
    date:{type:String,default:() => new Date().toISOString().split('T')[0]}
})

const AccountModel=mongoose.model("account",Accountschema)

export {AccountModel as Account}