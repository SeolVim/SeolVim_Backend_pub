const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const Script = require('../../models/script')

//server IP
const config = require('../../config')
const serverIP = config.serverName

exports.signUp = (request, response) => {
    const { email, password } = request.body

    //create user if not exist
    const create = (user) => {
        if(user) {
            if(user.email == email)
                throw new Error('duplicated')
        } else {
            console.log("user creating...")
            return User.create(email, password)
        }
    }
    const respond = () =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : email,
            }
        })
    }
    const onError = (error) => {
        response.status(409).json({
            message: error.message
        })
    }

    //check nickname duplication
    User.findOneByEmail(email)
        .then(create)
        .then(respond)
        .catch(onError)

}

exports.signIn = (request, response) =>{
    const {email, password} = request.body
    const secret = request.app.get('jwt-secret')

    //check the user info & generate the jwt
    const check = (user) => {
        if (!user) {
            //user does not exist
            throw new Error('login failed')
        } else {
            if (user.verify(password)) {
                const p = new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            _id: user._id,
                            email : user.email
                        },
                        secret,
                        {
                            expiresIn: '7d',
                            issuer: 'seolvim',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve([token, user])
                        })
                })
                return p
            } else {
                throw new Error('login failed')
            }
        }
    }


    const respond = (token, user) =>{
        response.cookie('token', token)
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : email,
            },
            token : token,
        })
    }

    //error occured
    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    //find the user
    User.findOneByEmail(email)
        .then(check)
        .then(([token, user]) => respond(token, user))
        .catch(onError)
}

exports.check = (request, response) => {
    response.json({
        success: true,
        info : request.decoded
    })
}

exports.signOut = (request, response) => {
    response.cookie('token', null)
    response.status(204)
    response.json({
        header : {
            message : "success"
        }
    })
}

/*
exports.view = (request, response) => {
    const userE = request.params.email ? request.params.email : request.decoded['email']
    const check = (user) => {
        if (!user) {
            //user does not exist
            throw new Error('No matching email')
        }
        return user
    }

    const respond = (user) =>{
        //console.log(userE)
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : user.email,
                nickname : user.nickname,
            },
        })
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    User.findOneByEmail(userE)
        .then(check)
        .then(respond)
        .catch(onError)


}
*/

exports.createScript = (request, response) => {
    const email = request.decoded.email
    const check_user = (user) =>{
        return new Promise(function (resolve, reject) {
            if (!user) {
                throw new Error('No matching User')
            }
            resolve(user)
        })
    }



    const respond = (script) =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : request.decoded.email,
                script : script.script,
            }
        })
    }
    const onError = (error) => {
        response.status(409).json({
            message: error.message
        })
    }


    User.findOneByEmail(email)
        .then((user) => check_user(user))
        .then((user) => {
            return Script.findOneAndReplaceScript(user, request.file.filename)
        })
        .then(respond)
        .catch(onError)

}

//Check Chat Room
exports.getScript = (request, response) => {
    const email = request.decoded.email
    const check = (script) => {
        return new Promise(function (resolve, reject){
            if (!script){
                //room does not exist
                throw new Error('Has No Script')
            }
            resolve(script)
        })
    }
    const respond = (script) =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                script : serverIP + script.script
            },
        })
    }
    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    User.findOneByEmail(email)
        .then((user) => Script.findOneByUser(user))
        .then(check)
        .then(respond)
        .catch(onError)
}

