const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const blogPostsSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  author: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
  },
  publishDate: Date
});


blogPostsSchema.virtual('authorString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostsSchema.methods.apiRepr = function() {

  return {
    id: this._id,
    title: this.title,
    content: this.content,
    author: this.authorString,
    publishDate: this.publishDate
  };
}

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const BlogPosts = mongoose.model('blogposts', blogPostsSchema);

module.exports = {BlogPosts};
