const assert = require('assert');
const server = require('../server');
const request = require('request');
const fs = require('fs');

describe('server tests', () => {
  before(done => {
    server.listen(3000, done);
  });

  after(done => {
    server.close(done);
  });

  describe('GET', () => {
    it('should return index.html', done => {
      /*
        1. launch server
        2. request GET /
        3. read index.html from disk
        4. compare response and content
        5. terminate server
      */

      const content = fs.readFileSync('public/index.html', {encoding: 'utf-8'});

      request('http://localhost:3000', (err, response, body) => {
        if (err) return done(err);

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['content-type'], 'text/html');
        assert.equal(body, content);
        done();
      });

    });

    it('should return requested file', done => {
      /*
        1. check if path of the request file goes to files directory
        2. check if user don't try to request subfolder
        3. if file doesn't exist server returns error
        4. if there is some issues with reading the file return error
        5. return file to client if everything is ok
       */

        const content = fs.readFileSync('files/index.js', {encoding: 'utf-8'});

        request('http://localhost:3000', (err, response, body) => {
          if (err) return done(err);

          // content.path.includes();
          // done();
        });
    })
  });

  describe('POST', () => {
    it('should receive file', done => {
      /*
        1.

       */
    });
  })
});
