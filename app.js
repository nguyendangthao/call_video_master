const express = require('express');
const app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
//var   cookieParser = require('cookie-parser');

var userRoute = require('./routes/users.route');
var authRoute = require('./routes/auth.route');
var registerRoute = require('./routes/register.route');
var roomRoute = require('./routes/room.route');

var authMiddleware = require('./middleware/auth.middleware');

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
    //app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000000000 }
}));

app.use(express.static('public'));
app.use("/uploads", express.static('uploads'));

//Route
app.get('/', function(req, res) {
    res.render('index'); //index.pug
});
app.get('/create', registerRoute);
app.post('/create', registerRoute);

app.use('/users', authMiddleware.requireAuth, userRoute);
app.use('/auth', authRoute);
app.use('/rooms', authMiddleware.requireAuth, roomRoute);

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: storage });


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/rooms/index.pug');
});

app.post('/uploadfile', upload.single("myFile"), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error('Please choose files');
        error.httpStatusCode = 400;
        return next(error);
    }
    var filePath = './uploads/' + req.file.filename;
    res.end('<a href=' + filePath + '>' + req.file.originalname + '</a>')
});


//Setup Error Handlers
/*const errorHandlers = require("./handlers/errorHandlers");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}*/


module.exports = app;