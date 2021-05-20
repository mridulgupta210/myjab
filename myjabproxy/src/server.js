const express = require('express');
const path = require('path');
const api_helper = require('./apiHelper')

// ignore request for FavIcon. so there is no error in browser
const ignoreFavicon = (req, res, next) => {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end();
    }
    next();
};

// fn to create express server
const create = async () => {

    // server
    const app = express();

    // configure nonFeature
    app.use(ignoreFavicon);

    // root route - serve static file
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

    // Error handler
    /* eslint-disable no-unused-vars */
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
    return app;
};

module.exports = {
    create
};
