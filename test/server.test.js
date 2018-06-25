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
      // файл должен быть скопирован до запуска тестов автоматически
      // (before|beforeEach|after|afterEach)
        request('http://localhost:3000/index.js', (err, response, body) => {
            assert.equal(response.statusCode, 200);
            assert.equal(body, 'console.log(\'hello world\');\n');

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
          /*
            1. Streams
              request.get|.post - .pipe
            2. request.post({
                 uri: http://localhost:3000/file.txt,
                 body: fs.createReadStream()|fs.readFileSync()
               }, (err, response, body) => {})
          */

            // request.get('http://localhost:3000/index.js')
            fs.createReadStream('files/index.js')
                .pipe(request.post('http://localhost:3000/index2.js', (err, response, body) => {
                    let sendedFile = fs.readFileSync('files/index.js');
                    let receivedFile = fs.readFileSync('files/index2.js');

                    assert.equal(body, 'OK');
                    assert.equal(response.statusCode, 200);
                    assert.equal(sendedFile.toString(), receivedFile.toString());

                    done();
            }));

            after(done => fs.unlink('files/index2.js', done));
        });

        it('if file already exists returns error 409', done => {
           // request.get('http://localhost:3000/index.js')
           fs.createReadStream('files/index.js')
               .pipe(request.post('http://localhost:3000/index.js', (err, response, body) => {
                   assert.equal(response.statusCode, 409);
                   assert.equal(response.body, 'File exists');

                   done();
               }));
        });

        it('should return error if file is too big', done => {
            // request.get('http://localhost:3000/big.png')
            //     .on('response', function(response) {
            //         console.log(response.statusCode); // 200
            //     })
            fs.createReadStream('files/big.png')
                .pipe(request.post('http://localhost:3000/big2.png', (err, response, body) => {
                    // console.log(response);
                    assert.equal(response.statusCode, 413);
                    assert.equal(body, 'File is too big!');
                    try {
                      fs.statSync('files/big2.png');
                    } catch (err) {
                      assert.equal(err.code, 'ENOENT');
                      return done();
                    }
                    assert.fail('File exists');
                }));


            // after(done => {
            //     fs.unlink('files/big2.png', done);
            // });
        });
    });

    describe('DELETE', () => {
        before(() => {
            const file = fs.readFileSync('files/index.js', {encoding: 'utf-8'});
            console.log(file.toString());

            fs.writeFileSync('files/index2.js', file);
        });

        it('should remove file', done => {
            request.delete('http://localhost:3000/index.js', (err, response, body) => {
                assert.equal(body, 'Ok');
                assert.equal(response.statusCode, 200);

                done();
            });
        });



        it('should return error if file doesn\'t exist', done => {
            request.delete('http://localhost:3000/index3.js', (err, response, body) => {
                assert.equal(response.statusCode, 404);

                done();
            });
        });


    });
});
