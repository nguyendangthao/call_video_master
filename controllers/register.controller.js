var User = require('../models/user.model');
var ObjectId = require('mongodb').ObjectId;
var md5 = require('md5');


module.exports.create = function (req, res) {
    res.render('./create');//users/create.pug
};

module.exports.postCreate = function (req, res) {
    var newuser = new User(req.body);
    var query = {
        $or: [
            { email: req.body.email },
            { name: req.body.name }
        ]
    };
    User.findOne(query, function (err, user) {
        //console.log('user',user);
        if (err) console.log(err);
        else {
            if (user) {
                let txt = user.name === req.body.name ? 'Name' : 'Mail';
                res.render('create', {
                    errors: [
                        `${txt} already exists!`
                    ],
                    values: req.body
                })
                return;
            }
            newuser.password = md5(req.body.password);
            newuser.save(function (err, res) {
                if (err) throw err;
                console.log(res.name + " saved to users collection.");
            });
            res.redirect('/users');
        }
    })

};