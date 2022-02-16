//MongoDB dependencies
const { MongoClient, ObjectId } = require("mongodb");

//MongoDB connection variables
const client = new MongoClient("mongodb+srv://PRO150:pass@cluster0.k7uok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
const db = client.db("PRO150");
const collection = db.collection("User");

exports.index = async (req, res) => {
    res.render("index", {
        title: "Website",
    });
};
