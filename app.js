const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();

const db = knex({
                    client: 'pg',
                    connection: {
                    host : '127.0.0.1',
                    port : 5432,
                    user : 'postgres',
                    password : 'monmon',
                    database : 'smartbrain'
                    }
                });


const app = express();

app.use(cors())

const users = [{
    id: 0,
    email: 'sample',
    fullname: 'test',
    password: 'dummy',
    entries: 0,
    createdAt: new Date()
}]


//MIDDLEWARES
app.use(express.urlencoded({extended: false}));
app.use(express.json());



//ROUTERS

//Homepage
app.get('/', (req, res) => {
    res.status(200).json('Welcome')
})

app.post('/register', (req, res) => {
    const {email, fullname, password} = req.body

    bcrypt.hash(password, 10, async(err, hashedPassword) => {
        if (err) {
            res.status(400).json('Error occurred during user creation')
        } else {
                db.transaction(trx =>  {
                    const newLoginCreds = { email: email, hash:hashedPassword }
                   
                    trx.insert(newLoginCreds).into('login').returning('email')
                      .then(loginEmail => { 
                        const newUser = { email: loginEmail[0].email, name: fullname, joined: new Date() }
                         trx('users').returning('*').insert(newUser)
                            .then(user => {res.json(user[0])})
                    })
                 .then(trx.commit)
                 .catch(trx.rollback)
                })
        }
    })
})

//Signin
app.post('/signin', (req, res) => {
    const {email, password} = req.body

    db.select('email', 'hash').from('login').where('email', '=', email)
        .then(data => {
           const userIsValid =  bcrypt.compare(password, data[0].hash);

           if (userIsValid) {
                return db.select('*').from('users').where('email', '=', email)
                        .then(user => { return res.status(200).json(user[0])})
                        .catch(err => res.json('Error in Finding User: Unable to find user'))
            } else {
                return res.status(400).json("Wrong Credentials")
            } 
        })
        .catch(err => {return res.status(400).json("Wrong Credentials")})
})


//Images
app.put('/profile/:id/images', (req, res) => {
    const {id} = req.params
    
    db('users').where('id', '=', id).increment(entries, 1).returning(entries)
        .then(count => {res.status(200).json(count[0].count)})
        .catch(err => {res.status(400).json('Error While Updating Count of Entries')})
})

//Profile
app.get('/profile/:id', (req, res) => {
    const {id} = req.params

    db.select('*').from('users').where({id})
    .then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(400).json('User Not Found')
        }
    })
    .catch(err => {res.status(400).json('Error Occured while Finding User')})
})

// 404 Error Handling
app.use((req, res) => {
    res.status(404).json('Error in finding URL')
})


app.listen(3000, () => {console.log('listening to server')})