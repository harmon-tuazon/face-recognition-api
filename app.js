const express = require('express');
require('dotenv').config()

const app = express();


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

    const newUser = users.push({
                                id: 1,
                                email: email,
                                fullname: fullname,
                                password: password
                            })
    res.json(newUser)
})

//Signin
app.post('/signin', (req, res) => {
    const {email, password} = req.body

    users.forEach(user => {
        if (email === user.email && password === user.password) {
            return res.json(user)
        } else {
            return res.status(400).send("User Not Found")
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
