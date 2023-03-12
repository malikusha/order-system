const express = require("express");
const fs = require("fs")

const PORT = process.env.PORT || 3001;

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded());

app.get("/api/get_menu", (req, res) => {
    fs.readFile("./menu.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("Error reading menu from disk:", err);
          return;
        }
        try {
          const menu = JSON.parse(jsonString);
          res.status(201).json({status: 201, menu})
        } catch (err) {
          console.log("Error parsing JSON string:", err);
        }
    });
});

app.post("/api/submit_order", (req, res) => {
    // TODO: validate the data
    // check('id_token').isLength({ min: 1 }),
    // check('price_id').isLength({ max: 60 })
    const { order_info } = req.body
    const jsonString = JSON.stringify(order_info)
    fs.writeFile('./orders.json', jsonString, err => {
        if (err) {
            console.log('Error writing into orders', err)
            // return res.status(401).json({errors: })
        } else {
            console.log('Successfully submitted order')
            return res.sendStatus(200);
        }
    })
    
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});