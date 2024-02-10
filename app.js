const express = require('express');
const cors = require('cors');
const knex = require('knex');
const passport = require('passport')
require('dotenv').config();
const { getLogOut } = require('./controllers')



export const db = knex({
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


//MIDDLEWARES
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({ secret: "mysecret", resave: false, saveUninitialized: true }))
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });


//ROUTERS

//Homepage
app.get('/', (req, res) => {
    res.status(200).json('Welcome')
})


//Register
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
app.post('/signin', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signin"
}))

//Signout
app.get('/signin', getLogOut)


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