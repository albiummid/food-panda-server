const express = require('express');
const cors = require('cors');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const { query } = require('express');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config();

app.get('/', (req, res) => {
    res.send('Hello World!- This is food panda SERVER')
})


const uri = `mongodb+srv://${process.env.DB_ID}:${process.env.DB_PASS}@cluster0.gpn2l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const resturantCollection = client.db(`${process.env.DB_NAME}`).collection('resturants');
    const foodsCollection = client.db(`${process.env.DB_NAME}`).collection('foods');
    console.log("database connected , err:", err);



    app.get('/nearbyResturants', (req, res) => {
        resturantCollection.find({distance:{$lte:5}})
            .toArray((error, resturants) => {
                res.send(resturants);
            })
    })

    app.get('/topRatedResturants', (req, res) => {
        resturantCollection.find({ratings:{$gte:4.5}})
            .toArray((error, resturants) => {
                res.send(resturants);
            })
    })

    app.get('/resturants', (req, res) => {
        const search = req.query.search;
        if (search) {
            resturantCollection.find({ name: { $regex: search } })
                .toArray((error, resturants) => {
                    res.send(resturants);
                    console.log(error);
                })
        }
        else {
            resturantCollection.find({})
                .toArray((error, resturants) => {
                    res.send(resturants);
                })
        }

    })


    app.get('/foods', (req, res) => {
        const searchResturant = req.query.resturant;
        const searchFood = req.query.search;
        if (searchResturant) {
            foodsCollection.find({resturant:searchResturant})
            .toArray((errors, foods) => {
                res.send(foods);
        })
        }
        else if(searchFood) {
            foodsCollection.find(
                {
                    name: /^searchFood/
                }
    
            )
            .toArray((errors, foods) => {
                res.send(foods);
        })
        }
        else {
            foodsCollection.find()
            .toArray((errors, foods) => {
                res.send(foods);
        })
        }
    })


    //end of MongoDB function
});








app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
});
