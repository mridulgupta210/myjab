const router = require('express').Router();
let User = require('../models/user.model');

// router.route('/').get((req, res) => {
//     User.find()
//         .then(users => res.json(users))
//         .catch(err => res.status(400).json('Error: ' + err));
// });

router.route('/remove/:email').put((req, res) => {
    User.updateOne({ email: req.params.email }, { enabled: false })
        .then(resp => res.json(resp))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const { username, email, pincode, districts, filters } = req.body;

    User.findOne({ email })
        .then(user => {
            if (user && user.enabled === false) {
                User.updateOne({ email }, { username, email, pincode, districts, filters, enabled: true })
                    .then(() => res.json('User updated!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            } else {
                const newUser = new User({ username, email, pincode, districts, filters });

                newUser.save()
                    .then(() => res.json('User added!'))
                    .catch(err => res.status(400).json('Error: ' + err));
            }
        })
});

module.exports = router;
