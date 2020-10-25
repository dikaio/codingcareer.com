
let arc = require('@architect/functions')
let parseBody = arc.http.helpers.bodyParser
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STR_SK_LIVE, {
  maxNetworkRetries: 2, // Retry a request twice before giving up
});

let idMap = {
  'book': 'price_1HfuidKWe8hdGUWLxmTQHB5E',
  'community': 'price_1HfukDKWe8hdGUWLBQOZ4OdZ',
  'creator': 'price_1HfuidKWe8hdGUWLxmTQHB5E',
}

// let wrapcurlies = txt => `{{${txt}}}`
let wrapcurlies = txt => txt
exports.handler = async function http(request) {
  let body = parseBody(request) // Pass the entire request object
  let item = idMap[body.item]
  // console.log({item, body})
  if (!item) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'unrecognized item',
        body,
        item
      })
    }
  }
  let coupon = body.coupon
  let referer = body.referer
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
        price: wrapcurlies(item),
        quantity: 1,
      }],
    discounts: coupon ? [{
      coupon: wrapcurlies(coupon)
    }] : undefined,
    metadata: {
      referer: referer || 'no_referer'
    },
    mode: 'payment',
    success_url: 'https://learninpublic.org/success',
    cancel_url: 'https://learninpublic.org/#buy',
  });

  return {
    statusCode: 200,
    // headers: { 'content-type': 'text/html; charset=utf8' },
    body: JSON.stringify({id: session.id})
  }
}