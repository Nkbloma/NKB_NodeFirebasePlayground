const express = require('express');
const server = express();

server.use(express.urlencoded({extended:false}))
server.use(express.json())
server.set('view engine', 'pug')

server.get('/pugform', (req, res) => {
    res.render('PugForm')
})

server.post('/pugsuccess', (req, res) =>{
    const usern = req.body;
    console.log(usern)
    res.render('pugSuccess', {loginemail: usern.username})
    
})
server.listen(9000);