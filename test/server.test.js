const assert = require('assert');
const server = require('../server');
const request = require('request');
const fs = require('fs');
const config = require('config');
const path = require('path');

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

    /*
      1. should return requested file if the path is correct
      2. if file doesn't exist server returns error
      3. check if user don't try to request subfolder
      4. if there is some issues with reading the file return error
     */

    it('should return requested file if the path is correct', done => {
        request('http://localhost:3000/index.js', (err, response, body) => {
            assert.equal(response.statusCode, 200);
            assert.equal(body, 'console.log(\'hello world\');');

            done();
        });
    });

  it('should return error if file doesn\'t exist', done => {
      request('http://localhost:3000/index.html', (err, response, body) => {
          assert.equal(response.statusCode, 404);
          assert.equal(body, 'Not found');

          done();
      });
  });

    it('should return error if the path has nested subfolders', done => {
        request('http://localhost:3000/files/subfolder/index.js', (err, response, body) => {
            if (err) return done(err);

            assert.equal(response.statusCode, 400);
            assert.equal(body, 'Nested paths are not allowed');

            done();
        });
    });


    it('should return error if the path has ".." symbols', done => {
        request('http://localhost:3000/../files/index.js', (err, response, body) => {
            if (err) return done(err);

            assert.equal(response.statusCode, 400);
            assert.equal(body, 'Nested paths are not allowed');

            done();
        });
    });

  });

    describe('POST', () => {
        it('should upload file', done => {
            request.get('http://localhost:3000/index.js')
                .pipe(request.post('http://localhost:3000/index2.js', (err, response, body) => {
                    let sendedFile = fs.readFileSync('files/index.js');
                    let receivedFile = fs.readFileSync('files/index2.js');

                    assert.equal(body, 'OK');
                    assert.equal(response.statusCode, 200);
                    assert.equal(sendedFile.toString(), receivedFile.toString());

                    done();
            }));

            after(done => {
                fs.unlink('files/index2.js', err => {
                    if (!err) {
                        done();
                    }
                });
            });
        });

        it('should return error if file is too big', done => {
            request.get('http://localhost:3000/big.png')
                .pipe(request.post('http://localhost:3000/big.png', (err, response, body) => {
                    // assert.equal(err, 'ddd');
                    assert.equal(response.statusCode, 413);
                    assert.equal(body, 'File is too big!');

                    done();
                }));
        });
  })
});
