const db = require('./app.js')
const bcrypt = require('bcryptjs');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

//Return User Function from User Table
const getUserFromUsersTable = (email) => {
      db.select('*').from('users').where('email', '=', email)
        .then(user => {return user})
        .catch(err => res.json('Error in Finding User: Unable to find user'))
}

//Local Strategy for Login
passport.use(
    new LocalStrategy(async (email, password, cb) => {
        try{
            const correctCreds = await db.select('email', 'hash').from('login').where('email', '=', email)
            const match = await bcrypt.compare(password, correctCreds.password);
        
            if (!correctCreds) {
                res.status(400).json("Wrong Credentials")
                return cb(null, false);
            };
            if (!match) {
                res.status(400).json("Wrong Credentials")
                return cb(null, false);
            } else {
               return cb(null, getUserFromUsersTable(email))
            } 
        } catch(err) {
            return cb(err, false);
        }
    })
)

//Logout User 
const postLogOut = (req, res, next) => {
    req.logout((err) => {
        (err) ?  next(err) : res.redirect('/')
    })

}

module.exports = {
    getLogOut
 }