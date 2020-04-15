const admin = require("firebase-admin");
const express = require('express');
const firebase = require("firebase");

const server = express();

server.use(express.urlencoded({extended:false}))
server.use(express.json())
server.set('view engine', 'pug');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://nkb-nodefirebaseplayground.firebaseio.com",
});

const db = admin.firestore();


server.get(['/', '/home'], (req, res) => {
    res.render('PugForms')
})

server.post('/loggedin', (req, res) =>{
    const email = req.body.useremail;
    admin.auth().getUserByEmail(email)
      .then(function(userRecord){
        res.render('LoginSuccess', {loginemail: email})
        console.log(`Got data: ${userRecord.toJSON().email}`)
      })
      .catch(function(error) {
        res.render('pugFail')
        console.log(`Error fetching user data: ${error}`);
      });
    
})

server.post(['/', '/home'], (req, res) =>{
  admin.auth().createUser({
    email: req.body.newEmail,
    password: req.body.newPassword})
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully created new user:');
      res.render("PugForms", {SignUpMessage: `Successfully created new user: ${req.body.newEmail}`})
    })
    .catch(function(error) {
      console.log('Error creating new user:' + error);
      res.render("PugForms", {SignUpMessage: `Failed to create new user: ${error}`})
    })
});
server.listen(9000);


/*
admin.auth().createUser({
    email: 'maingo@hotmail.com',
    password: 'Mb0206982!'
}).then(function(userRecord) {
  // See the UserRecord reference doc for the contents of userRecord.
  console.log('Successfully created new user:');
})
.catch(function(error) {
  console.log('Error creating new user:');
});

admin.auth().getUserByEmail('mago@hotmail.com')
.then(function(userRecord){
  console.log(`Got data: ${userRecord.toJSON().email}`)
})
.catch(function(error) {
  console.log(`Error fetching user data: ${error}`);
 });

Reading data, 1 document
let docRef = db
    .collection("UserCollection")
    .doc('Email2')
    .get()
    .then(function (doc) {
          console.log(doc.id, '=>', doc.data());
    })
    .catch(function (error) {
      console.log(`Didn't get it: ${error}`);
    })

  Press I
  Go to sign in code
  Press U
  Go to sign up code
  T
  Go to task code, if no one is signed in say you haven't signed in and go back
  Otherwise, either make task, list tasks, or sign out. Not gonna worry about delete.
  Also, B will go back to first prompt. As in end
  
  Q:
  Quit everything. Full program since it uses, JS, JSON, Authenticate, Firebase, and Git

  */