const functions = require('firebase-functions');
const express = require('express');
const firebase = require("firebase");
const config = require('./config.js');
const flash = require('express-flash')
const session = require('express-session')

  
  const server = express();

  server.use(express.urlencoded({extended:false})) //Middleware to convert form requests into strings and arrays.
  server.use(express.json())                       //Middleware to convert form requests into JSON.
  server.use(session(config.sessionConfig))        //Configures a cookie session for flash messages.
  server.use(flash())                               //Initalizes the app for flash messages.
  server.use(function(req, res, next){
    res.locals.info_message = req.flash('info');
    next();
  });
  
  server.set('view engine', 'pug');               //Sets Pug as template engine.
  
  firebase.initializeApp(config.firebaseConfig)
  const Auth = firebase.auth();
  const db = firebase.firestore();
  const TaskCollection = db.collection('UserCollection')
  
  
  server.get('/home', (req, res) => {
      res.render('HomeForms', {flash_messages: res.locals.info_message})
  })
  
  server.get(`/users/:userid`, (req, res) =>{
      var getCurrentUser = Auth.currentUser
      if(getCurrentUser==null){
        req.flash('info', `No user is entered.`);
        res.redirect('/home')
      }
      else{
        var getDocQuery= TaskCollection.where('email', '==', getCurrentUser.email);
        getUsersTasks(getCurrentUser, getDocQuery, req, res);
      }
  })
  server.post(`/SignedInSubmit`, (req, res) =>{
    const email = req.body.useremail;
    const password = req.body.password;
    signInUser(email, password, req, res);
  })

  server.post('/SignedOutSubmit', (req, res) =>{
      var loggedOutEmail = Auth.currentUser.email
      Auth.signOut();
      req.flash('info', `User ${loggedOutEmail} signed out.`);
      res.redirect("/home")  
  });
  
  server.post('/NewUserSubmit', (req, res) =>{
      var newUserEmail = req.body.newEmail;
      var newUserPassword = req.body.newPassword;
      createNewUser(newUserEmail, newUserPassword, req, res);
  })
  
  
  server.post("/EnterNewTask", (req, res)=>{
      enterNewTask(req, res);
  })
  
  var signInUser = (userEmail, userPassword, req, res) => {
    Auth.signInWithEmailAndPassword(userEmail, userPassword)
      .then(function(){
        res.redirect(`users/${Auth.currentUser.uid}`)
      })
      .catch((error) =>{
        req.flash('info', `${error}`);
        res.redirect('/home')
      })
  }
  
  var createNewUser = (newEmail, newPassword, req, res) => {
    Auth.createUserWithEmailAndPassword(newEmail, newPassword)
    .then(() => {
      var newUserDoc = TaskCollection.add({
        email: newEmail,
        Tasks: []
      })
      req.flash('info', `User ${newEmail} created.`);
      res.redirect('/home')
    })
    .catch((error) => {
      req.flash('info', `${error}`);
      res.redirect('/home')
    })
  }
  
  var getUsersTasks = (currentUser, docQuery, req, res) => {
    docQuery.get()
    .then(snapshot => {
      if(snapshot.empty){
        req.flash('info', `User ${currentUser.email} has not been registered in database.`);
        res.redirect('/home');
      }
      snapshot.forEach(userDoc => {
        currentUsersTasks = userDoc.data().Tasks
      })
      res.render('UserTasks', {
        LoggedInEmail: currentUser.email,
        taskList: currentUsersTasks,
        flash_messages: res.locals.info_message
      })
    })
    .catch(error => {
      req.flash('info', `${error}`);
      res.render('UserTasks', {
        LoggedInEmail: currentUser.email,
        flash_messages: res.locals.info_message
      })
    }); 
  }
  
  var enterNewTask = (req, res) =>{
    var documentID;
    TaskCollection.where('email', '==', Auth.currentUser.email).get()
      .then(snapshot => {
        if(snapshot.empty){
          req.flash('info', `User ${Auth.currentUser.email} has not been registered in database.`);
          res.redirect('/home')
        }
        snapshot.forEach(doc => {
          documentID = doc.id
        })
        var getUserDocument = TaskCollection.doc(documentID)
        var taskUnion = getUserDocument.update({
          Tasks: firebase.firestore.FieldValue.arrayUnion(req.body.newtask)
        })
        req.flash('info', 'Task added');
        res.redirect(`/users/${Auth.currentUser.uid}`)
      })
      .catch(err => {
        req.flash('info', 'Error with task');
        res.redirect(`/users/${Auth.currentUser.uid}`)
      });
  }

  exports.app = functions.https.onRequest(server)
  