const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')
const config = require('../config')
const fs = require('fs')


//made Room
const Script = new Schema({
    generator : { type : Schema.Types.ObjectId, ref: User, unique : true},
    script : String,
});

//create new user
Script.statics.create = function (user, scriptLink){
    //console.log(generator)
    const script = new this({
        generator : user,
        script : scriptLink
    })
    return script.save()
}

Script.statics.findOneByUser = function (user){
    return this.findOne({generator : user}).exec()
}


Script.statics.findOneAndReplaceScript = function(user, ScriptFileName){
    if(!user) {
        throw new Error("no matching user")
    }
    const script = this.findOne({generator : user}).exec()
        .then(script =>{
            if(script)//script 이미 있음
            {
                fs.unlink(__dirname + "/../scripts/" + script.script, (err) =>{
                    if(err){
                        console.log(err)
                        return new Error('while deleting scripts error')
                    }
                })
                this.findOneAndUpdate({ generator : script.generator },
                    {$set : { script : ScriptFileName }},
                    {returnNewDocument : true}).exec()
                script.script = ScriptFileName
                return script
            }
            else
            {
                const script = new this({
                    generator : user,
                    script : ScriptFileName
                })
                return script.save()
            }
        })
    /*
    this.findOneAndUpdate({ generator : script.generator },
        {$set : { script : ScriptFileName }},
        {returnNewDocument : true}).exec()
    script.script = ScriptFileName

     */
    return script
}


module.exports = mongoose.model('Script', Script)
