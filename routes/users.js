const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/remove/:email').delete((req, res) => {
    User.deleteOne({ email: req.params.email })
        .then(resp => res.json(resp))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const { username, email, pincode, districts, filters } = req.body;

    const newUser = new User({ username, email, pincode, districts, filters });

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
