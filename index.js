const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const path = require("path");
const axios = require('axios');
const got = require("got");

require('dotenv').config();

const api_helper = require('./apiHelper')

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client", "build")));

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const fetchData = function (callback) {
    let User = require('./models/user.model');

    var userData = User.find({});
    userData.exec(function (err, data) {
        if (err) throw err;
        return callback(data);
    })
}

const getDate = d => {
    let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    let mo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(d);
    let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    return `${da}-${mo}-${ye}`;
}

const hitApi = (pincode, district, date) => {
    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/${pincode ? 'calendarByPin' : 'calendarByDistrict'}?${pincode ? `pincode=${pincode}` : `district_id=${district}`}&date=${getDate(date)}`;
    console.log("url to cowin:", url);

    return got.get(url, {responseType: 'json'})
        .catch(err => {
            console.error(JSON.stringify(err));
            return [];
        })
        .then(response => {
            console.log("response from cowin:", response.body);
            return response.body.centers ? response.body.centers : [];
        });

    // return axios.get(url, {
    //     withCredentials: true,
    //     headers: { 'X-Requested-With': 'XMLHttpRequest' }
    // })
    //     .catch(err => {
    //         console.error(JSON.stringify(err));
    //         return [];
    //     })
    //     .then(response => {
    //         console.log("response from cowin:", JSON.stringify(response));
    //         return response.centers ? response.centers : [];
    //     });

    // return api_helper.make_API_call(url)
    //     .catch(err => {
    //         console.error(JSON.stringify(err));
    //         return [];
    //     })
    //     .then(response => {
    //         console.log("response from cowin:", JSON.stringify(response));
    //         return response.centers ? response.centers : [];
    //     });
}

function sendMail(text, mailId) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "myjabnotifier@gmail.com",
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailDetails = {
        from: "myjabnotifier@gmail.com",
        to: mailId,
        subject: "Available slots",
        text
    };

    // Sending Email 
    mailTransporter.sendMail(mailDetails,
        function (err, data) {
            if (err) {
                console.log("Error Occurs", err);
            } else {
                console.log("Email sent successfully");
            }
        });
}

cron.schedule("*/10 * * * * *", function () {
    // cron.schedule("*/2 * * * *", function() {
    // cron.schedule('0 */1 * * *', function () {
    fetchData((users) => {
        users.forEach(user => {
            const centers = [];
            let date = new Date();
            const intervalId = setInterval(() => {
                hitApi(user.pincode, user.district, date)
                    .then(res => {
                        if (res.length === 0) {
                            clearInterval(intervalId);
                            onCentersFetchComplete();
                        } else {
                            date = date.addDays(7);
                            centers.push(...res);
                        }
                    })
            }, 10000);

            const onCentersFetchComplete = () => {
                const validCenters = [];
                centers.forEach(center => {
                    const sessions = center.sessions.filter(session => session.available_capacity > 0);
                    if (sessions.length > 0) {
                        validCenters.push({
                            centerName: center.name,
                            address: `${center.address}, ${center.block_name}, ${center.district_name} - ${center.pincode}`,
                            fees: center.fee_type,
                            slots: sessions
                        });
                    }
                })

                if (validCenters.length > 0) {
                    const text = buildText(user.username, validCenters);
                    sendMail(text, user.email);
                } else if (date.getHours() === 22) {
                    const text = `Hi ${user.username},

No slots found today for your search.

Stay indoors! Stay stafe!

Thanks,
My Jab
                    `;
                    sendMail(text, user.email);
                }
            };
        })
    });
}, {
    timezone: "Asia/Kolkata"
});

const buildText = (name, centers) => {
    let text = `Hi ${name},

Available centers in your areas are mentioned below:
`;

    centers.forEach((center, index) => {
        const newText = `
${index + 1}. ${center.centerName} (${center.address})
    Fee type: ${center.fees}
    Slots:
        ${center.slots.map((slot, i) => `${String.fromCharCode(97 + i)}. Date: ${slot.date}, 
            Min. Age Limit: ${slot.min_age_limit}
            Vaccine type: ${slot.vaccine}
            Available Capacity: ${slot.available_capacity}
            Available Capacity for dose1: ${slot.available_capacity_dose1}
            Available Capacity for dose2: ${slot.available_capacity_dose2}
            Time slots: ${slot.slots.join(", ")}
        `)}`;
        text = text + newText;
    });

    text = text + `
Stay indoors! Stay stafe!

Thanks,
My Jab
    `

    return text;
}

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
