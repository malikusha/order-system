const express = require("express");
const fs = require("fs")

const PORT = process.env.PORT || 3001;

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { orderValidationRules, validate } = require('./validator.js')

function fileReader(filePath, callback) {
    fs.readFile(filePath, (err, fileData) => {
      if (err) {
        return callback && callback(err);
      }
      try {
        const object = JSON.parse(fileData);
        return callback && callback(null, object);
      } catch (err) {
        return callback && callback(err);
      }
    });
}

// TODO: For when we have more users ordering at the same time, we will need to lock this file while writing to prevent race conditions
// but even better, for an actual app we would write this into a db
function addOrder(order_info) {
    var data = fs.readFileSync('./orders.json', 'utf8')

    if (!data) {
        orders = []
    } else {
        var orders = JSON.parse(data);
    }

    orders.push(order_info);  

    fs.writeFileSync('orders.json', JSON.stringify(orders, null, 4));
}

function findItemPrice(item_id) {
    const data = fs.readFileSync('./menu.json', 'utf8')
    const menu = JSON.parse(data);
    var price = null
    menu.items.forEach(item => {
        if (item.id === item_id) {
            price = item.price
        }
    });
    return price
}

app.get("/api/get_menu", async (req, res) => {
    fileReader("./menu.json", (err, menu) => {
        if (err) {
          return res.status(404).json({ errors: "Something went wrong, not found" });
        }
        return res.status(201).json({status: 201, menu: menu})
    });
});

app.post("/api/submit_order", 
    // TODO: put in a separate function, do a more proper sanitization and check with bank
    orderValidationRules(), 
    validate,
    (req, res) => {

    const { order_info } = req.body

    if (!order_info.items) {
        return res.status(400).json({ errors: "Empty order, add some items" });
    }

    var total = 0
    // check if all the items exist in the current menu and if total adds up        
    order_info.items.forEach(item => {
        const itemPrice = findItemPrice(item.item_id)
        if (itemPrice === null) {
            return res.status(400).json({ errors: "One of the ordered items not in menu" });
        }
        total += item.count*itemPrice
    });

    if (total !== order_info.orderTotal) {
        return res.status(400).json({ errors: "The order total seems to be incorrect" });
    }

    try {
        addOrder(order_info)
        return res.sendStatus(200);  
    } catch (err) {
        console.log("Error while writing into the file", err)
        return res.status(401).json({ errors: "Error while processing the order" });
    }
 
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});