const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AZ1Gj7PFckeS_278lcb38kIDCldFgnGQZu55e_6E2hCOPAVs2Z-VfRzqZ4Q4ojshPo-LNqSYVHoAp4a4',
    'client_secret': 'ELO3hMdKYlRmJkzOgsEolMAglCzUlhFhuJIwGWKbSEQP9Po4ygrTi1MG8X_jNamd8GYzSebeVPcn1Zpt'
  });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:4001/success",
            "cancel_url": "http://localhost:4001/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "299.00",
                    "currency": "AUD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "AUD",
                "total": "299.00"
            },
            "description": "Paid for Red Hat"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if(payment.links[i].rel === 'approval_url'){
                    // Can save paymentId to DB at this stage
                    // redirect user to paypal form
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

})

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId
    // find cart by paymentId
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "AUD",
                // cart.transaction_amount_cents
                "total": "299.00"
            }
        }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(payment);
            res.send('Success')
        }
    });
})

app.listen(4001, () => console.log('Server Started'));