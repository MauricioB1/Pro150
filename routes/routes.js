//MongoDB dependencies
const { MongoClient, ObjectId } = require("mongodb");

//MongoDB connection variables
const client = new MongoClient("mongodb+srv://PRO150:pass@cluster0.k7uok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
const db = client.db("PRO150");
const collection = db.collection("User");

////////////////////////exports methods to be used in index.js////////////////////////

//Returns the index page
exports.homepage = async (req, res) => {
    res.render("homepage", {
        title: "Website",
    });
};

//This will be deleted later
exports.testpage = async (req, res) => {
    res.render("testpage", {
        title: "TEST",
        people: await getAllUsers(),
    });
}

exports.signup = async (req, res) => {
    res.render("signup", {
        title: "Sign Up",
    });
}

exports.edit = async (req, res) => {
    await client.connect();
    const filteredDocs = await collection
        .find(ObjectId(req.params.id))
        .toArray();
    client.close();
    res.render("edit", {
        title: "Edit account",
        user: filteredDocs[0], 
    });
};

exports.editUser = async (req, res) => {
    await client.connect();
    const updateResult = await collection.updateOne(
        { _id: ObjectId(req.params.id) },
        {
            $set: {
                Username: req.body.Username,
                Password: req.body.Password,
                PFP: req.body.PFP,
                Bio: req.body.Bio,
                Edit_History: req.body.Edit_History,
            },
        }
    );
    client.close();
    res.redirect("/");
};

exports.delete = async (req, res) => {
    await deleteUser(req.params.id);
    res.redirect("/");
}

exports.create = async (req, res) => {
    
    await insertUser(req.body);
    console.log("It made it here...");
    res.redirect("/");
}

////////////////////////MongDB CRUD methods////////////////////////

const getAllUsers = async() => {
    await client.connect();
    const findResult = await collection.find({}).toArray();
    console.log("Users found: ", findResult);
    client.close();
    return findResult;
}

const insertUser = async(request) => {
    await client.connect();
    let user = {
        Username: request.Username,
        Password: request.Password,
        PFP: request.PFP,
        Bio: request.Bio,
        Edit_History: "Nothing yet...",
    };
    const insertResult = await collection.insertOne(user);
    client.close();
}

const deleteUser = async(id) => {
    await client.connect();
    const deleteResult = await collection.deleteOne({
        _id: ObjectId(id),
    });
    client.close();
}
