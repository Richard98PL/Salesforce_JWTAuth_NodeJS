const fs = require('fs')
const querystring = require('querystring');

const axios = require('axios')
const config = require('./config');
const jwt = require('jsonwebtoken');

const moment = require('moment')
const express = require('express')
const app = express()
app.set('trust proxy', 1)


var access_token;
let instance_url = '';

async function setSalesforceToken(){
    fs.readFile('../certs/server.key', 'utf8' , (err, serverKey) => {
    if(err) console.log(err.message);
    
    let jwtparams = {
        iss: config.CONSUMER_KEY,
        prn: config.USERNAME,
        aud: config.AUTH_ENDPOINT,
        exp: parseInt(moment().add(2, 'minutes').format('X'))
    };

    let token = jwt.sign(jwtparams, serverKey, { algorithm: 'RS256' });

    let params = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    };

    axios
        .post(config.AUTH_ENDPOINT, querystring.stringify(params), {
            headers : {
                'Content-Type' : 'application/x-www-form-urlencoded'
            }
        })
        .then(res => {
            if(debug) console.log(`Salesforce statusCode: ${res.status}`)
            if(debug) console.log('Salesforce instance: ' + res.data['instance_url']);
            if(debug) console.log('Salesforce token: ' + res.data['access_token'].substring(0,18) + '...');
            instance_url = res.data['instance_url'];
            access_token = res.data['access_token']

            sendHTTPRequestToSalesforce(instance_url, access_token);
        })
        .catch(error => {
            if(debug) console.log(error);
        })
    });
}

async function sendHTTPRequestToSalesforce(instance_url, access_token){
    let params = {
        Name: 'TestTODELETERESTAPI'
    };

    axios
        .patch(instance_url + '/services/data/v50.0/sobjects/Project_TT__c/Project_Number__c/TEST', params, {
            headers : {
                'Authorization' : 'Bearer ' + access_token,
                'Content-Type' : 'application/json'
            }
        })
        .then(res => {
            if(debug) console.log(`Salesforce statusCode: ${res.status}`)
        })
        .catch(error => {
            if(debug) console.log(error);
            console.log(access_token);
        })
}

app.get('/', (req,res) => {
    console.log('hello');
})

const port = 8080
app.listen(port, (error) =>{
    setSalesforceToken();

    if(error){
        console.log('Something went wrong', error)
    }else{
        console.log('Server is listening on port ' + port)
    }
})

const debug = true;