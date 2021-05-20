const express = require("express");
const cors = require('cors');

require('dotenv').config();

const api_helper = require('./apiHelper')

const app = express();

const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const hitApi = (pincode, district, date) => {
    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/${pincode ? 'calendarByPin' : 'calendarByDistrict'}?${pincode ? `pincode=${pincode}` : `district_id=${district}`}&date=${date}`;
    console.log("url to cowin:", url);

    return api_helper.make_API_call(url)
        .catch(err => {
            console.error(JSON.stringify(err));
            return [];
        })
        .then(response => {
            console.log("response from cowin:", JSON.stringify(response));
            return response.centers ? response.centers : [];
        });
}

app.get('/', (req, res) => {
    const { pincode, district, date } = req.query;

    hitApi(pincode, district, date)
        .then(respnse => res.send(respnse))
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
