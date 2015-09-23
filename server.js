var express = require('express'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    app = express(),
    http = require('http').Server(app);
    var io = require('socket.io')(http);

var databaseurl = "io";
var collections = ["socket"];
var db = require("mongojs").connect(databaseurl, collections);
//use middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session({
    secret: 'socket'
}));

app.use(express.static(__dirname + '/public'));
var email;

app.get('/', function (req, res) {
    res.sendfile('views/login.html')
});

app.get('/123', function (req, res) {
    res.sendfile('views/test.html')
});

app.get('/test', function (req, res) {
    res.sendfile('views/test1.html')
});

// Post methods on Login page
app.post('/login', function(req, res) {
    var log = {
        "email": req.body.email,
        "password": req.body.password
    }
        db.socket.findOne({email: log.email,password:log.password}, function (err, data) {
        if (data) {
           req.session.username = req.body.email;
            email =req.body.email;
            res.send(true);
        } else {
            res.send(false);
        }
    });
})

//post methods on Signup page
app.get('/signup', function (req, res) {
    res.sendfile('views/signup.html')
});

//Signup Post
app.post('/signup', function(req, res) {
    var sign = {
        "email": req.body.email,
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
        "password": req.body.password,
    }
     db.socket.findOne({
        email: sign.email
    }, function(err, data) {
        if (data) {
            res.send(false);
        } else {
            db.socket.save({
                email: sign.email,
                firstname: sign.firstname,
                lastname: sign.lastname,
                password: sign.password,
                contacts:[{user:'sabash@gmail.com',messages:[]},{user:'sathish@gmail.com',messages:[]},{user:'ravi@gmail.com',messages:[]}],
                }, function(err, data) {
                if (err) {
                    console.log('problem for storing data')
                } else {
                    db.socket.update({email:req.body.email},{$pull:{contacts:{user:req.body.email}}},function(err,data){});
                    req.session.username = req.body.email;
                    email = req.body.email;
                    res.send(true);
                }
            })
        }
    })
    })

//Home page
app.get('/home', function (req, res) {
    if(req.session.username)
    {
    res.sendfile('views/home.html')
    }
    else
    {
     res.redirect('/');   
    }
});

//get the my informaton from client side
app.get('/myinfo', function (req, res) {
    db.socket.findOne({email:req.session.username},function(err,data){
    if(err)
    {
        console.log("error occuering");
    }
     else
        {
            res.send(data)
        }
    })
});

app.get('/signout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
})


//<----------- socket connection starts here --------->

 var user={};
io.on('connection', function(socket){ 
 socket.on("myinfo",function(data){
     socket.username=data.email;
     user[socket.username]=socket.id;
     io.sockets.emit('online',user);
     //console.log(email,'120');
     //console.log(data.email,'121');
     //console.log(user)
    /* if(data.email==email)
     {
    // ntng do here
         console.log(true)
     }
     else
     {
         console.log(false)
       db.socket.update({email:email},{$addToSet:{'chat.user':data.email,messages:[]}},function(err,data1){
   
   })  
     }  */
 });
    
   
socket.on('chat message',function(data){  
if(user[data.email])
 {
io.sockets.connected[user[data.email]].emit('chat message',{msg:data.msg,name:socket.username});
 }
 else
{
socket.emit('offline',{msg:"offline",name:data.name});  
}  
 }) 

socket.on('trying',function(data)
{ 
   io.sockets.connected[user[data.to]].emit('trying',data);
 })

socket.on('webrtc',function(data){   
   io.sockets.connected[user[data.to]].emit('webrtc-msg',data); 
});

socket.on('decline',function(data)
{
io.sockets.connected[user[data.from]].emit('decline',data);
})

socket.on('accept',function(data)
{
io.sockets.connected[user[data.from]].emit('accept',data);
})

socket.on('timeout',function(data){ 
   
   io.sockets.connected[user[data.from]].emit('timeout',data);
 }) 

socket.on('refresh',function(data){ 
   io.sockets.connected[user[data.from]].emit('refresh',data);
 })

socket.on('cutcall',function(data){ 
   io.sockets.connected[user[data.from]].emit('cutcall',data);
 })

socket.on('busy',function(data){ 
   io.sockets.connected[user[data.from]].emit('busy',data);
 })

socket.on('block',function(data){ 
   io.sockets.connected[user[data.from]].emit('block',data);
 })



/*
 //offer answer candidates are recevide here   
socket.on('webrtc',function(data){   
   io.sockets.connected[user[data.email.to]].emit('webrtc-msg',data); 
});
    
    //user busy fnction 
socket.on('busy',function(data)
          {
io.sockets.connected[user[data.email.from]].emit('busy',data);
})
//user cutcall function 
socket.on('decline',function(data)
{
io.sockets.connected[user[data.email.to]].emit('decline',data);
})
//user decline the call function
socket.on('declined',function(data)
{
    io.sockets.connected[user[data.email.from]].emit('declined',data);
})
//user accept call function
socket.on('accept',function(data){ 
   io.sockets.connected[user[data.email.to]].emit('accept',data);
 })
//user join the call progress
socket.on('accepted',function(data){ 
    io.sockets.connected[user[data.email.from]].emit('accepted',data);
 })
//user timeout function 
socket.on('timeout',function(data){ 
   io.sockets.connected[user[data.email.from]].emit('timeout',data);
 })  
//user left the call rining process here
socket.on('timeouted',function(data){ 
   io.sockets.connected[user[data.email.to]].emit('timeouted',data);
 })  
//use can refresh the page 
socket.on('refresh',function(data){ 
   io.sockets.connected[user[data.email.from]].emit('refresh',data);
 })
//block the camera and microphone
socket.on('block',function(data){ 
   io.sockets.connected[user[data.email.to]].emit('block',data);
 })
*/

//user can left the connection
socket.on('disconnect',function(){
    delete user[socket.username]
    io.sockets.emit('online',user)
 })
})





//server running on this method
http.listen(3333);
console.log('server running on 3333');