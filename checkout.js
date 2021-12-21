const express = require('express');
const ejs = require('ejs');
const paypal = require('@paypal/checkout-server-sdk');

  // Creating an environment
let clientId = "yours";
let clientSecret = "yours";

// This sample uses SandboxEnvironment. In production, use LiveEnvironment
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);




const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', async (req, res) => {

    let request = new paypal.orders.OrdersCreateRequest();

    request.requestBody({
        "intent": "CAPTURE",
        "application_context": {
         "return_url": "http://localhost:4001/success",
         "cancel_url": "http://localhost:4001/cancel",
        },
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "AUD",
                    "value": "400.00"
                }
            }
         ]
    });

    // Call API with your client and get a response for your call
    client.execute(request).then((createdOrderDetails)=> {
        console.log('createdOrderDetails.result.links', createdOrderDetails)
            for (let i = 0; i < createdOrderDetails.result.links.length; i++) {
                if(createdOrderDetails.result.links[i].rel === 'approve'){
                    // Can save paymentId to DB at this stage
                    // redirect user to paypal form
                    res.redirect(createdOrderDetails.result.links[i].href);
                }
            }
    }).catch((error) => console.log(error)) 
});

app.get('/success', async(req, res) => {
    // req.query.orderId -> apporved order id
    const { token: orderId } = req.query;
        let request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        // Call API with your client and get a response for your call
        let response = await client.execute(request);
        console.log(`Response: ${JSON.stringify(response)}`);
        // If call returns body in response, you can get the deserialized version from the result attribute of the response.
        // console.log(`Capture: ${JSON.stringify(response.result)}`);
        res.send('SUCCESFULLY PAYED')
});

app.get('/cancel', (req, res) => {
    res.send('The payment was cancelled')
})

app.listen(4001, () => console.log('Server Started'));