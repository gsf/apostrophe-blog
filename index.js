var async = require('async');
var _ = require('underscore');
var extend = require('extend');
var snippets = require('apostrophe-snippets');
var util = require('util');

module.exports = blog;

// Expose the constructor for potential inheritance
blog.Blog = Blog;

function blog (options, callback) {
  return new Blog(options, callback);
}

function Blog (options, callback) {
  var self = this;
  _.defaults(options, {
    instance: 'blogPost',
    name: options.name || 'blog',
    label: options.name || 'Blog',
    // Find our templates before the snippet templates (a chain of overrides)
    dirs: (options.dirs || []).concat([ __dirname ]),
    // Overridden separately so that one can have types that just
    // override the templates and don't mess with replacing
    // all of the javascript and CSS
    webAssetDir: __dirname + '/public',
    // The default would be aposBlogPostMenu, this is more natural
    menuName: 'aposBlogMenu'
  });

  console.log('constructing blog with dirs option set to:');
  console.log(options.dirs);

  // Call the base class constructor. Don't pass the callback, we want to invoke it
  // ourselves after constructing more stuff
  snippets.call(this, options, null);

  // The snippet dispatcher is almost perfect for our needs, except that
  // we expect the publication date of the blog post to appear before the slug
  // of the blog post in the URL. So spot that situation, change req.remainder
  // to just the slug of the blog post, and invoke the original version of
  // "dispatch."

  // Grab the "superclass" version of the dispatch method so we can call it
  var superDispatch = self.dispatch;

  self.dispatch = function(req, callback) {
    if (req.remainder.length) {
      var matches = req.remainder.match(/^\/\d+\/\d+\/\d+\/(.*)$/);
      if (matches) {
        req.remainder = matches[1];
      }
    }
    superDispatch.call(this, req, callback);
  };

  self.getDefaultTitle = function() {
    return 'My Article';
  };

  // Invoke callback on next tick so that the blog object
  // is returned first and can be assigned to a variable for
  // use in whatever our callback is invoking
  process.nextTick(function() { return callback(null); });
};
