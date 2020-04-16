const admin = require("firebase-admin");
const express = require('express');
const firebase = require("firebase");
const config = require('./config.js');
const flash = require('express-flash')
const session = require('express-session')

const server = express();

server.use(express.urlencoded({extended:false}))
server.use(express.json())
server.use(session({
  cookie: {maxAge: 60000},
  saveUninitialized: true,
  resave: 'true',
  secret: 'key'
}))
server.use(flash())



server.set('view engine', 'pug');

//'Mb0206982!'
firebase.initializeApp(config.firebaseConfig)
const db = firebase.firestore();
const TaskCollection = db.collection('UserCollection')

server.get('/home', (req, res) => {
    res.render('PugForms', {messages: req.flash('info')})
})

//Redirect exists.. *facepalm*
server.post('/SignedOutSubmit', (req, res) =>{
  var loggedOutEmail = firebase.auth().currentUser.email
  firebase.auth().signOut();
  console.log(`Signing out as ${loggedOutEmail}`)
  req.flash('info', `User ${loggedOutEmail} signed out.`);
  res.redirect("/home")  
});

server.post('/NewUserSubmit', (req, res) =>{
  newUserEmail = req.body.newEmail,
  newUserPassword = req.body.newPassword
  firebase.auth().createUserWithEmailAndPassword(newUserEmail, newUserPassword)
    .then(() => {
      let newUserDoc = TaskCollection.add({
        email: newUserEmail,
        Tasks: []
      })
      console.log("Created new Doc: " + newUserDoc)
      req.flash('info', `User ${newUserEmail} created.`);
      res.redirect('/home')
    })
    .catch((error) => {
      req.flash('info', `${error}`);
      res.redirect('/home')
    })
})

server.post(`/users`, (req, res) =>{
  const email = req.body.useremail;
  const password = req.body.password;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(){
      console.log(`Signed in with ${firebase.auth().currentUser.email}`)
      res.redirect(`users/${firebase.auth().currentUser.uid}`)
    })
    .catch((error) =>{
      req.flash('info', `${error}`);
      res.redirect('/home')
    })
})

server.get(`/users/:userid`, (req, res) =>{
  let getCollection = db.collection('UserCollection');
  let queryWhere = getCollection.where('email', '==', firebase.auth().currentUser.email);
  var queriedTasks;

  queryWhere.get()
    .then(snapshot => {
      if(snapshot.empty){
        console.log('None')
      }
      snapshot.forEach(doc => {
        queriedTasks = doc.data().Tasks
      })
      res.render('UserTasks', {
        LoggedInEmail: firebase.auth().currentUser.email,
        taskList: queriedTasks,
        messages: req.flash('info')
      })
    })
    .catch(err => {
      console.log('Error getting documents', err);
      });
    
})

server.post("/EnterNewTask", (req, res)=>{
  var documentID;
  let userDoc1 = TaskCollection.where('email', '==', firebase.auth().currentUser.email).get()
    .then(snapshot => {
      if(snapshot.empty){
        console.log('None')
      }
      snapshot.forEach(doc => {
        documentID = doc.id
        console.log(documentID);
      })
      var userDoc2 = TaskCollection.doc(documentID)
      var taskUnion = userDoc2.update({
        Tasks: firebase.firestore.FieldValue.arrayUnion(req.body.newtask)
      })
      req.flash('info', 'Task added');
      res.redirect(`/users/${firebase.auth().currentUser.uid}`)
    })
    .catch(err => {
      console.log('Error getting documents', err);
      });
})
server.post("/ListTask", (req, res)=>{

})

server.listen(9000);

/*let getCollection = db.collection('UserCollection');
let queryWhere = getCollection.where('email', '==', 'maingo@hotmail.com');
queryWhere.get()
  .then(snapshot => {
    if(snapshot.empty){
      console.log('None')
      return;
    }
    snapshot.forEach(doc => {
      datas = doc.data()
      console.log(datas.Tasks[0]);
      
    })
  })
  .catch(err => {
    console.log('Error getting documents', err);
    });

  */