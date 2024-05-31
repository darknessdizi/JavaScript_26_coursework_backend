const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors'); // правила политики cors
const koaStatic = require('koa-static');
const path = require('path');
// const router = require('./routes'); // импортируем набор роутеров по файлу index.js в папке
const Router = require('koa-router');
const http = require('http');
const WS = require('ws'); // сервер для WebSocket от клиентов
// const delay = require('koa-delay'); // задержка ответа сервера delay(2, 3) 2 - до, 3 - после ответа
// const slow = require('koa-slow'); // задержка ответа сервера
// const dataBase = require('./db');
// const websockify = require('koa-websocket');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // импортируем v4 из uuid и переименовываем как uuidv4
const { DataFiles } = require('./db');

function sendAllUsers(message, sender) {
	Array.from(wsServer.clients)
		.filter((client) => client.readyState === WS.OPEN)
		.forEach((client) => client.send(message));
}

const dataBase = new DataFiles();
dataBase.init();

const app = new Koa();

const public = path.join(__dirname, '/public');
app.use(koaStatic(public)); // Дает возможность раздавать файлы

app.use(koaBody({ // чтобы обработать тело запроса
  // (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

// app.use(cors()); // задаем правила для политики CORS
app.use( // задаем правила для политики CORS
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

const router = new Router(); // создали роутер
app.use(router.routes());

// app.use(slow({
//   delay: 4000, // задержка ответа сервера
// }));

// app.use(delay(2000)); // задержка ответа сервера

// app.use(router()); // подключаем маршрутизатор

const port = process.env.PORT || 9000;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({
  server
});

router.post('/message', (ctx) => {
  console.log('POST запрос на сервер от:', ctx.request.header.referer); // показать url источника запроса
  console.log('POST тело:', ctx.request.body);
  // console.dir(ctx.request.files);
  if (ctx.request.body.type === 'message') {
    const obj = {
      status: 'addMessage',
      result: dataBase.addData(ctx.request.body),
    };
    ctx.response.status = 200;
    sendAllUsers(JSON.stringify(obj));
  }
});

router.post('/unload', async (ctx) => {
  const { body } = ctx.request;
  console.log('************* upload *************', body);
  // console.dir(ctx.request.files);
  const file = ctx.request.files.file; // Get upload files
  console.log('file', file.name, file.type);
  const reader = fs.createReadStream(file.path); // Create-readable stream
  const ext = file.name.split('.').pop(); // Get upload the file extension
  console.log('ext', ext);
  let upStream = null;
  if (file.type === 'video/webm') {
    const name = `record.${uuidv4()}.${ext}`;
    upStream = fs.createWriteStream(`public/${name}`);
    body.content = {};
    body.content.name = name;
    body.content.originalName = file.name;
    body.content.path = `/${name}`;
    reader.pipe(upStream);
  }
  if (body.type === 'video') {
    const obj = { 
      status: 'addVideo',
      result: dataBase.addData(body),
    };
    ctx.response.status = 200;
    setTimeout(() => sendAllUsers(JSON.stringify(obj)), 100);
    // поставил таймер с целью избежать Error: write ECONNABORTED
  }
});

wsServer.on('connection', (ws) => { // ws и есть сам клиент
  console.log('Соединение с клиентом');
  ws.send(JSON.stringify({
    status: 'connection',
    result: dataBase.getData(),
  }))

  ws.on('close', (number) => {
    console.log('Соединение закрыто', number);
  });
});

server.listen(port, (err) => {
  // два аргумента (1-й это порт, 2-й это callback по результатам запуска сервера)
  if (err) { // в callback может быть передана ошибка
    // (выводим её в консоль для примера, если она появится)
    console.log(err);
    return;
  }
  console.log('Server is listening to 9000 port ************************');
});
