/**
 ЗАДАЧА
 Написать HTTP-сервер для загрузки и получения файлов
 - Все файлы находятся в директории files
 - Структура файлов НЕ вложенная.

 - Виды запросов к серверу
    GET / - index.html

   GET /file.ext
   - выдаёт файл file.ext из директории files,

   POST /file.ext
   - пишет всё тело запроса в файл files/file.ext и выдаёт ОК
   - если файл уже есть, то выдаёт ошибку 409
   * при превышении файлом размера 1MB выдаёт ошибку 413

   DELETE /file.ext
   - удаляет файл
   - выводит 200 OK
   - если файла нет, то ошибка 404

 Вместо file может быть любое имя файла.
 Так как поддиректорий нет, то при наличии / или .. в пути сервер должен выдавать ошибку 400.

- Сервер должен корректно обрабатывать ошибки "файл не найден" и другие (ошибка чтения файла)
- index.html или curl для тестирования

 */

// mime <-> Content-Type

// Пример простого сервера в качестве основы

const url = require('url');
const fs = require('fs');
const path = require('path');
const {createServer} = require('http');


console.log('server started');

const server = createServer((req, res) => {

  const pathname = decodeURI(url.parse(req.url).pathname);

  switch(req.method) {
  case 'GET':
    if (pathname === '/') {
        const filePath = path.join(__dirname, 'public', 'index.html');
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } else if (pathname.indexOf('/files/') > -1) {
        const filePath = path.join(__dirname, pathname);

        fs.stat(filePath, function (err, stats) {
            if (err || !stats.isFile()) {
                res.statusCode = 404;
                res.end("File not found");
            } else {
                const fileStream = fs.createReadStream(filePath);

                // res.writeHead(200, {'Content-Type': 'application/json'});

                // let mime = require('mime').getType(pathname);
                // res.setHeader('Content-Type', mime + "; charset=utf-8");
                res.setHeader('Content-Type', "application/txt; charset=utf-8");

                fileStream.pipe(res);
            }
        });
    } else {
        res.statusCode = 404;
        res.end("Not found");
    }

    break;

  default:
    res.statusCode = 502;
    res.end("Not implemented");
  }

});

server.listen(3000);
