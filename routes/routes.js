//MongoDB dependencies
const { MongoClient, ObjectId } = require("mongodb");
const axios = require('axios');
const bcrypt = require("bcryptjs");

//MongoDB connection variables
const client = new MongoClient("mongodb+srv://PRO150:pass@cluster0.k7uok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
const db = client.db("PRO150");
const collection = db.collection("User");
const comicCollection = db.collection("Comics");

const config = require('../config');
const { redirect, render } = require("express/lib/response");

////////////////////////exports methods to be used in index.js////////////////////////

//Returns the index page
exports.homepage = async (req, res) => {


    let heroes = [
        await fetchHero("620-spider-man"), await fetchHero("17-alfred-pennyworth"), await fetchHero("470-moon-knight")
    ];

    res.render("homepage", { /////////can check the different pages by changing this////////////
        title: "Website",
        user_name: config.user[0][1],
        pfp: config.user[1][1],
        config: config,
        heroes: heroes
    });
};

exports.comicpage = async (req, res) => {

    await client.connect();
    const findResult = await comicCollection.findOne({slug: req.params.heroName});
    console.log("Comic found: ", findResult);
    client.close();

    if (findResult === null){
        console.log("Creating comic");
        res.render('comicpage', {
            title: 'comic page',
            config: config,
            hero: await fetchHero(req.params.heroName),
    
        });
    }
    else {
        console.log("Finding comic")
        res.render('comicpage', {
            title: 'comic page',
            config: config,
            hero: findResult,
    
        });
    }


    
};

exports.userpage = async (req, res) => {
    await client.connect();
    const findUser = await collection.findOne({_id: ObjectId(req.session.user.id)});
    //const testPassword = bcrypt.compareSync(req.body.Password,findUser.Password);
    ////if(testPassword){
    //console.log(findUser);
    console.log(req.session.user)
    
    if (req.session.user.id){

        res.render("login",{
            user: findUser,
            config:config
        })
        client.close()
    }
    else {
        res.redirect("/");
    }

};

exports.editcomicpage = async (req, res) => {

    await client.connect();
    const findResult = await comicCollection.findOne({slug: req.params.heroName});

    console.log(req.params.heroName);

    console.log("Comic found: ", findResult);
    client.close();

    if (findResult === null){
        console.log("Creating comic");
        res.render('editcomicpage', {
            title: 'edit comic page',
            config: config,
            hero: await fetchHero(req.params.heroName),
    
        });
    }
    else {
        console.log("Finding comic")
        res.render('editcomicpage', {
            title: 'edit comic page',
            config: config,
            hero: findResult,
    
        });
    }
};

exports.changeComic = async(req, res) => {

    let hero = await fetchHero(req.params.heroName);

    await client.connect();
    const updateResult = await comicCollection.updateOne(
        {slug: req.params.heroName},
        {
            $set: {
                name: req.body.heroName,
                biography: {
                    fullName: req.body.heroFName,
                    placeOfBirth: req.body.POB,
                    publisher: req.body.pub
                },
                images: {
                    md: req.body.mdImage
                }
                
            }
        },
        {upsert: true}
    );
    console.log(" found: ", updateResult);
    client.close();

    res.redirect('/comicpage/' + hero.slug);
}

/////

exports.user = (req, res) => {
    res.render('user', {
        title: 'user',
        config: config
    });
};

exports.index = (req, res) => {
    res.render('index', {
        title: 'index',
        config: config
    });
};

exports.loggedin = (req, res) => {
    res.render('loggedin', {
        title: 'loggedin',
        config: config
    });
};

exports.signup = (req, res) => {
    res.render('signup', {
        title: 'signup',
        config: config
    });
};


//This will be deleted later
exports.testpage = async (req, res) => {
    res.render("testpage", {
        title: "TEST",
        people: await getAllUsers(),
        heroes: await fetchAllHeroes(),
        config: config
    });
}

// exports.signup = async (req, res) => {
//     res.render("signup", {
//         title: "Sign Up",
//     });
//}

exports.login = async (req, res) =>{
    await client.connect();
    const findUser = await collection.findOne({Username : req.body.username, Password : req.body.password});
    //const testPassword = bcrypt.compareSync(req.body.Password,findUser.Password);
    ////if(testPassword){
    console.log(findUser);
    
    if (findUser != null){
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username,
            id: findUser._id
        }
        res.render("login",{
            user: findUser,
            config:config
        })
        client.close()
    }
    else {
        res.redirect("/");
    }

        
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
    if (req.body.password.length == 0) {
        const updateResult = await collection.updateOne(
            { _id: ObjectId(req.params.id) },
            {
                $set: {
                    Username: req.body.username,
                    Bio: req.body.bio,
                    Edit_History: req.body.edit_History,
                },
            }
        );
    } else {
        const updateResult = await collection.updateOne(
            { _id: ObjectId(req.params.id) },
            {
                $set: {
                    Username: req.body.username,
                    Password: req.body.password,
                    Bio: req.body.bio,
                    Edit_History: req.body.edit_History,
                },
            }
        );
    }
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

exports.search = async (req,res) => {
    const response = await axios.get("https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json");

    let data = JSON.stringify(response.data);

    let json = JSON.parse(data);

    var filtered = json.filter(jsonObject => 
        jsonObject.name.toLowerCase().includes(req.body.searchText));

    console.log(filtered);

    res.render("results", {
        title: "Results: ",
        config: config,
        results: filtered, 
    });

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


////////////////////////API methods////////////////////////

let fetchAllHeroes = async() => {
    
    const res = await axios.get("https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json");

    let data = JSON.stringify(res.data);

    let json = JSON.parse(data);

    console.log(json[0].name);

    return json;

}

let fetchHero = async(heroName) => {
    const res = await axios.get("https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json");

    let data = JSON.stringify(res.data);

    let json = JSON.parse(data);

    var filtered = json.filter(jsonObject => 
        jsonObject.slug.includes(heroName));

    return filtered[0];
}