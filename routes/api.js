/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
    MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      var collection = db.collection('books');
      collection.find().toArray((err, docs) => {
        if(err) return;
        docs.forEach(doc => doc.commentcount = doc.comments.length);
        res.json(docs);
      });
    });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      var book = {
        title: title,
        comments: []
      };
      if(!title){ res.send('missing title')}
      else{
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      var collection = db.collection('books');
      collection.insertOne(book, (err, doc) => {
        if(err) return;
        book._id = doc.insertedId;
        res.json(book);
      });
    });
    }
  })
  
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      var collection = db.collection('books');
      collection.remove({}, (err, doc) => {
        if(err) return;
        res.send('complete delete succesful');
      });
    });
  })



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    if(bookid.length !== 24){res.send('no book exists')}
    else{
    var oid = new ObjectId(bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
     MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      var collection = db.collection('books');
      collection.find({_id: oid}).toArray((err, docs) => {
        if(err) return;
        if(docs.length == 0) {res.send('no book exists')}
        else {
        res.json(docs[0]);
        }
      });
    });
    }
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    var oid = new ObjectId(bookid);
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
     var collection = db.collection('books');
      collection.findAndModify({_id: oid}, {}, {$push: {comments: comment}}, {new: true, upsert: false}, (err, doc) => {
        if(err) return;
         res.json(doc.value);
      });
    });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
    var oid = new ObjectId(bookid);
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
      var collection = db.collection('books');
      collection.remove({_id: oid}, (err, doc) => {
        if(err) return;
         res.send('delete succesful');
      });
    });
    });
     
}
