const express = require("express");
const fs = require("fs")

const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api/get_menu", (req, res) => {
    fs.readFile("./menu.json", "utf8", (err, jsonString) => {
        if (err) {
          console.log("Error reading menu from disk:", err);
          return;
        }
        try {
          const menu = JSON.parse(jsonString);
          console.log("Menu categories:", menu.categories); 
          res.json({ menu });
        } catch (err) {
          console.log("Error parsing JSON string:", err);
        }
    });
});

app.post("/api/submit_order", (req, res) => {
    // TODO: validate the data
    const order_info = req.json()
    const jsonString = JSON.stringify(order_info)
    fs.writeFile('./orders.json', jsonString, err => {
        if (err) {
            console.log('Error writing into orders', err)
        } else {
            console.log('Successfully submitted order')
        }
    })
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});