const mongoose = require('mongoose');
const initData= require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
} 

const initDB = async () =>{
    await listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner:"685d27dd50a03637a90ee7cb"}));
    await listing.insertMany(initData.data);
    console.log("data was inserted");
}

initDB();