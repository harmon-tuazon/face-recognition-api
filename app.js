const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config()

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
    res.json()
})

//Register
app.post('/register', (req, res) => {
    const {email, fullname, password} = req.body

    bcrypt.hash(password, 10, async(err, hashedPassword) => {
        if (err) {
            throw new Error(err)
        } else {

            const newUser = users.push({
                id: 1,
                email: email,
                fullname: fullname,
                password: hashedPassword
            })
            
            res.status(201)
        }
    })  
})

//Signin
app.post('/signin', (req, res) => {
    const {email, password} = req.body

    users.forEach(user => {
        if (email === user.email) {
            bcrypt.compare(password, user.password, function(err, res) {
                if (err) {
                    return res.status(400).send({message: "Wrong User Credentials"})
                } else {
                    return res.json(user)
                }
            })
        } else {
            return res.status(400).send({message: "User Not Found"})
        }
    })

})

//Images
app.put('/profile/:id/images', (req, res) => {
    const {id} = req.params
    const specificUser = users.filter(user => {return user.id === id})

    let newEntriesCount = specificUser[0].entries++

    res.json(newEntriesCount)
})



//Profile
app.get('/profile/:id', (req, res) => {
    const {id} = req.params
    const specificUser = users.filter(user => {return user.id === id})

    res.json(specificUser[0])
})

// 404 Error Handling
app.use((req, res) => {
    res.status(404).json()
})


app.listen(3000, () => {console.log('listening to server')})