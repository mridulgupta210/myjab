const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const path = require("path");
const fetch = require("node-fetch");

require('dotenv').config();

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

    var userData = User.find({ $or: [{ enabled: true }, { enabled: undefined }] });
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

const hitApi = (pincode, districts, date) => {
    const data = [];

    return Promise.all(districts.map(district => {
        const url = `${process.env.PROXY_URL}?${pincode ? `pincode=${pincode}` : `district=${district}`}&date=${getDate(date)}`;
        return fetch(url)
            .then(res => res.json())
            .then(response => response ? data.push(...response) : []);
    }
    )).then(() => data).catch(err => {
        console.error(JSON.stringify(err));
        return [];
    });
}

function sendMail(text, mailId, html) {
    let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailDetails = {
        from: process.env.EMAIL_ID,
        to: mailId,
        subject: "Available slots",
        text,
        html
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

// cron.schedule("*/10 * * * * *", function () {
cron.schedule('0 */1 * * *', function () {
    fetchData((users) => {
        users.forEach(user => {
            const centers = [];
            let date = new Date();
            const intervalId = setInterval(() => {
                hitApi(user.pincode, user.districts, date)
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
                console.log("aggregated response", centers);
                const validCenters = [];
                centers.filter(center => !user.filters.feetype || center.fee_type === user.filters.feetype).forEach(center => {
                    const sessions = center.sessions.filter(session => session.available_capacity > 0 &&
                        (!user.filters.dosetype || (user.filters.dosetype === 1 ? session.available_capacity_dose1 > 0 : session.available_capacity_dose2 > 0)) &&
                        (!user.filters.age || user.filters.age === session.min_age_limit) &&
                        (!user.filters.vaccinetype || user.filters.vaccinetype === session.vaccine));
                    if (sessions.length > 0) {
                        validCenters.push({
                            centerName: center.name,
                            district: center.district_name,
                            address: `${center.address}, ${center.block_name}, ${center.district_name} - ${center.pincode}`,
                            fees: center.fee_type,
                            slots: sessions
                        });
                    }
                })

                if (validCenters.length > 0) {
                    // const text = buildText(user.username, validCenters);
                    const html = buildHtml(user.username, validCenters);
                    sendMail(undefined, user.email, html);
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

const buildHtml = (name, centers) => {
    let html = `
        <div>
            <p>Hi ${name},</p>
            <p>Available centers in your selected areas are mentioned below:</p>
            <table style="font-family: arial, sans-serif;border-collapse: collapse;width: 100%;">
                <tr>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Date</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">District</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Center name</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Address</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Fee type</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Min. Age Limit</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Vaccine type</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Available Capacity</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Available Capacity for dose 1</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Available Capacity for dose 2</th>
                    <th style="border: 1px solid #dddddd;text-align: center;padding: 8px;">Time slots</th>
                </tr>
    `;

    centers.forEach(center => {
        center.slots.forEach(slot => {
            html = html + `
                <tr>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.date}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${center.district}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${center.centerName}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${center.address}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${center.fees}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.min_age_limit}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.vaccine}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.available_capacity}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.available_capacity_dose1}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.available_capacity_dose2}</td>
                    <td style="border: 1px solid #dddddd;text-align: center;padding: 8px;">${slot.slots.join(", ")}</td>
                </tr>
            `;
        });
    });

    html = html + `
            </table>
            <p>Stay indoors! Stay stafe!</p>
            <p>Thanks,</p>
            <p>My Jab</p>
        </div>
    `;

    return html;
}

const usersRouter = require('./routes/users');

app.use('/users', usersRouter);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
