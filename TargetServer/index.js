const express = require('express');
const session = require('express-session');
const handlebars = require('express-handlebars');
const fs = require('fs');
// Importa el módulo path
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos desde la carpeta 
app.use(express.static(path.join(__dirname)));

// Middlewares

app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false,
}));

app.set("views", __dirname);
app.engine("hbs", handlebars({
  defaultLayout: 'main',
  layoutsDir: __dirname,
  extname: '.hbs',
}));
app.set("view engine", "hbs");

// Login

const login = (req, res, next) => {
    if(!req.session.userId){
        res.redirect('/login');
    }else{
        next();
    }
}


// DB

const users = JSON.parse(fs.readFileSync('db.json'));

// Routes

app.get('/home', login, (req, res)=>{
    res.render('home');
    //res.send('Home page, must be logged in to access');
})

app.get('/login', (req, res)=>{
    res.render('login');
});

app.get('/', login, (req, res)=>{
    res.render('home');
});

app.post('/login', (req, res)=>{

    if (!req.body.email || !req.body.password){
        return res.status(400).send('Fill all the Fields');
    }

    const user = users.find(user => user.email === req.body.email);
    if (!user || user.password !== req.body.password){
        return res.redirect('login');
    }
    req.session.userId = user.id;
    console.log(req.session);
    res.redirect('/home');
})

app.get('/logout', login, (req, res)=>{
    req.session.destroy();
    res.render('logout');
});

app.get('/edit', login, (req, res)=>{
    res.render('edit');
});

app.post('/edit', login, (req, res)=>{
    const user = users.find(user => user.id === req.session.userId);
    user.email = req.body.email;
    user.password = req.body.password;

    console.log(`User ${user.id} email changed to ${user.email}`);
    console.log(`User ${user.id} password changed to ${user.password}`);

    res.render(`changed`);
});

// Server

app.listen(PORT, ()=> console.log(`Listening on PORT ${PORT}`));