//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const today = date();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Atlas connection string
const uri = 'mongodb+srv://Abhiram:Abhiram%401567@cluster0.1pxv9v3.mongodb.net/todolistdb?retryWrites=true&w=majority';
// Replace <username>, <password>, <cluster-url>, and <database-name> with your actual values.

mongoose.connect(uri, {
    useNewUrlParser: true
})
    .then(() => {
        console.log("Connected to MongoDB Atlas");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB Atlas:", error);
    });

const itemschema = mongoose.Schema({
    name: {
        type: String
    }
});

const listschema = mongoose.Schema({
    name: String,
    items: [itemschema]
});

const Item = mongoose.model("item", itemschema);
const List = mongoose.model("list", listschema);

var heading = "";

app.get("/", (req, res) => {
    Item.find()
        .then((items) => {
                const data = {
                    heading: "Today",
                    day: today,
                    todoitem: items,
                }
                res.render("todolist", data);
            })
})


app.get("/:id", (req, res) => {
    const customList = _.capitalize(req.params.id)
        
    List.findOne({ name: customList })
        .then((foundList) => {
            if (!foundList) {
                const list = new List(
                {
                    name: customList,
                    items: []
                }
                )
                list.save()
                res.redirect("/" + customList)
            } else {
                const data = {
                    heading: foundList.name,
                    day: today,
                    todoitem: foundList.items
                }
                res.render("todolist", data)
        }
        })
        .catch((err) => {
        console.log("error: " + err)
    })

})

app.get("/about", (req, res) => {
    res.render("about")
})

app.post("/", (req, res) => {
    const newItem = req.body.input
    const list = req.body.button

    if (newItem !== "") {
        const item = new Item({
            name: newItem
        })

        if (list === "Today") {
            item.save()
            res.redirect("/")
        } else {
            List.findOne({ name: list })
                .then((customList) => {
                    customList.items.push(item)
                    customList.save()
                    res.redirect("/" + list)
                })
        }
    } else {
        if (list === "Today") {
            res.redirect("/")
        } else {
            res.redirect("/" + list)
        }
    }
});

app.post("/delete", (req, res) => {
    const listName = req.body.hidden
    const delItemId = req.body.checkbox

    if (listName === "Today") {
        Item.findByIdAndDelete(delItemId)
            .then((op) => {
                res.redirect("/")
        })
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: delItemId } } })
            .then((op) => {
            res.redirect("/"+ listName)
        })
    }

})

app.listen(3000, () => {
    console.log("XOserver");
});
