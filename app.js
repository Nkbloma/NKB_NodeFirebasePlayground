const admin = require("firebase-admin");
const express = require('express');
const firebase = require("firebase");
const config = require('./config.js')
const server = express();

server.use(express.urlencoded({extended:false}))
server.use(express.json())
server.set('view engine', 'pug');

//'Mb0206982!'
firebase.initializeApp(config.firebaseConfig)
//const db = admin.firestore();


server.get('/home', (req, res) => {
    res.render('PugForms')
})

server.post('/home/:formType', (req, res) =>{
  var enteredForm = req.params.formType
  if(enteredForm=='UserHasSignedOut'){
    var loggedOutEmail = firebase.auth().currentUser.email
    console.log(`Signing out as ${loggedOutEmail}`)
    firebase.auth().signOut();
    res.render("PugForms", {SignUpMessage: `Signed out as ${loggedOutEmail}`})
  }
  if(enteredForm == 'UserHasSignedUp'){
    newUserEmail = req.body.newEmail,
    newUserPassword = req.body.newPassword
    firebase.auth().createUserWithEmailAndPassword(newUserEmail, newUserPassword)
      .then(() => {
        res.render("PugForms", {SignUpMessage: `Successfully created new user: ${newUserEmail}`})
      })
      .catch((error) => {
        res.render("PugForms", {SignUpMessage: `Failed to create new user: ${error}`})
      })
  }
});

server.post('/UserHomeMenu', (req, res) =>{
    
    const email = req.body.useremail;
    const password = req.body.password;
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then( function(){
      console.log(`Signed in with ${firebase.auth().currentUser.email}`)
      res.render('UserMenu', {Signed_in_User: email})
    })
    .catch((error) =>{
      console.log(error)
      res.render('PugForms', {SignUpMessage: `Sign In failed: ${error}`, getuseremail: email})
    })
    
})

server.listen(9000);