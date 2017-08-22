var express = require('express');
var bodyParser     =        require("body-parser");
var app = express();
var port = 8080;
var router = express.Router();
var baseUrl = "/serviceregistry-roa/resourcedirectory/v1/servicergistrations";
var MongoClient = require('mongodb').MongoClient;
//for localhost
var mongoConnStr = "mongodb://localhost:27017/Registry";
//for Docker
//var mongoConnStr = "mongodb://Service:dhrproject@mongo:27017/serviceregistry";
var bodyParser = require("body-parser");
var extend = require('util')._extend;
var ObjectID = require('mongodb').ObjectID;
var collectionName = "serviceregistry";
var cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

process.on('uncaughtException', function (error)	 {
    console.log(error.stack);
});

app.use(cors());

function createErrorMsg(msg) {
    var o ={};
    extend(o, {"error": msg});
    return o;
}



app.get(baseUrl + '/:service_id', function(req,res){
    var result;
    res.type('json');
    console.log(req.params.service_id +" Service id");

    console.log("/connect to mongo");
    MongoClient.connect(mongoConnStr, function(err, db) {
        if (err) {
            console.log("conn failed");
            throw err;
            res.status(500);
            res.send();
            return;
        };
        console.log("getting service by id " + req.params.service_id);

        db.collection(collectionName).findOne({id: req.params.service_id},function(err, doc) {

            if (doc){
                res.header("content-type", "application/json");
                res.send(JSON.stringify(doc));
            } else {
                console.log('no data for this id');
                res.status(404);
                res.send("NOT FOUND");
            }
            db.close();
        });
        if (err) {
            console.log("error")
         //   throw err;
            res.status(500);
            res.send();
        }
    });
    // res.send(JSON.stringify(result));

});


app.get(baseUrl, function(req,res){
    var result;
    res.type('json');
    console.log("/connect to mongo");
    MongoClient.connect(mongoConnStr, function(err, db) {
        if (err) {
            console.log("conn failed");
          //  throw err;
            res.status(500);
            res.send();
            return;
        };
        db.collection(collectionName).find().toArray(function(err, doc) {
            if (doc){
                console.log(doc._id);
                res.header("content-type", "application/json");
                res.send(JSON.stringify(doc));
            } else {
                console.log('no data for this id');
                res.status(404);
                res.send("NOT FOUND");
            }
            db.close();
        });
        if (err) {
            console.log("error")
           // throw err;
            res.status(500);
            res.send();
        }
    });
    // res.send(JSON.stringify(result));

});


app.post(baseUrl, bodyParser.json(), function (req, res) {
	contype = req.headers['content-type'];
    if (!contype || contype.indexOf('application/json') !== 0) {
        res.status(400);
        return res.send(JSON.stringify(createErrorMsg("content type should be application/json")));
    }

    console.log("post");
    res.type('json');
    MongoClient.connect(mongoConnStr, function(err, db) {
        if (err) {
            console.log("conn failed");
           // throw err;
            res.status(500);
            res.send();
            return;
        };
        console.log("insert into " + collectionName);
        db.collection(collectionName).insert(req.body, {safe:true}, function(err, records) {
            if (err) {
                console.log("error in insert")
               // throw err;
                res.status(500);
                res.send();
                db.close();
                return;
            }
            res.header('location', baseUrl + "/" + req.body.id);
            res.status(201);
            res.send('OK');
            /*
            db.collection(collectionName).update({"_id" :ObjectID(records.insertedIds[0]) },{$set : {"id":records.insertedIds[0]}}, function(err, records) {
            if (err) {
                //throw err;
                res.status(500);
                res.send();
                db.close();
                return;
            }
            res.status(201);
            res.send('OK');
            db.close();
        });
           */
        });

    });
});






/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
app.listen(port);
