import moongose from 'mongoose'

const seasonSchema= new moongose.Schema({
    season:{type:Number,required:true,unique:true},
    matches: [
    {
      team1: { type: String, required: true },
      team2: { type: String, required: true }
    }
  ]
})
const seasonModel=moongose.model("season",seasonSchema)

export {seasonModel as Season}