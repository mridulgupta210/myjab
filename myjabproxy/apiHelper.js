const request = require('request')

module.exports = {
    make_API_call : function(url){
        return new Promise((resolve, reject) => {
            request(url, { 
                json: true,
                headers: {
                    Host: 'cdn-api.co-vin.in',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
                }
             }, (err, res, body) => {
              if (err) reject(err)
              resolve(body)
            });
        })
    }
}