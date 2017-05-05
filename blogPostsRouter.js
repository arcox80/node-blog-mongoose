const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

//GET request to /blog-posts returns all posts in the database
router.get('/', (req, res) => {
  BlogPosts
    .find()
    .exec()
    .then(blogPosts => {
      res.json({
        blogPosts: blogPosts.map(
          (blogPost) => blogPost.apiRepr()
        )
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      }
    );
});

router.get('/:id', (req, res) => {
  BlogPosts
    .findById(req.params.id)
    .exec()
    .then(blogPost =>res.json(blogPost.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

router.post('/', jsonParser, (req, res) => {
  // ensure title, content, and author are in request body
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPosts
    .create({
      title: req.body.title,
      content: req.body.content,
      author: {
        firstName: req.body.author.firstName,
        lastName: req.body.author.lastName
      },
      publishDate: req.body.publishDate || new Date()})
    .then(
      blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


router.put('/:id', jsonParser, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }
  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(blogPost => res.status(201).json(blogPost.apiRepr()).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


router.delete('/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(blogPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
