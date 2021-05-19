const redis = require('redis');
const {promisify} = require('util');

let OrdersBST = require('./ordersBST');
let Orders = new OrdersBST().getInstance();

const client = redis.createClient();

let redis_key = "ORDERS";
const setAsync = promisify(client.hset).bind(client);
const getAsync = promisify(client.hget).bind(client);
const deleteAsync = promisify(client.hdel).bind(client);


const insert_to_bst = async (side, price) => {
    let sideFound = Orders.find(price);
    if (sideFound && sideFound["side"] !== side) {
        Orders.remove(price)
    } else Orders.insert({price, side})
}

const insert_to_redis = async (side, price) => {
    let sideFound = getAsync(redis_key, price)
    if (sideFound && sideFound !== side) {
        deleteAsync(redis_key, price)
    } else setAsync(redis_key, price, side)
}


exports.createTradingOrder = async (req, res) => {
    let {side, price} = req.body;

    Promise.all([
        insert_to_bst(side, price),
        insert_to_redis(side, price)]
    ).then((response) => {
        console.log(response);
    // TODO: Now we can save order to database
    }).catch((err) => {
        console.error(err);
    });
}