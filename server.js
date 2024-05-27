const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors'); // правила политики cors
// const router = require('./routes'); // импортируем набор роутеров по файлу index.js в папке
const Router = require('koa-router');
const http = require('http');
const WS = require('ws'); // сервер для WebSocket от клиентов
// const delay = require('koa-delay'); // задержка ответа сервера delay(2, 3) 2 - до, 3 - после ответа
// const slow = require('koa-slow'); // задержка ответа сервера
const dataBase = require('./db');
// const websockify = require('koa-websocket');

const app = new Koa();

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

router.post('/', (ctx) => {
  console.log('POST запрос на сервер от:', ctx.request.header.referer); // показать url источника запроса
  if (ctx.request.body.type === 'message') {
    const obj = {
      status: 'addMessage',
      result: dataBase.addData(ctx.request.body),
    };
    ctx.response.status = 200;
    sendAllUsers(JSON.stringify(obj));
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


//   // ws.on('message', (body) => {
//     // ws.send(JSON.stringify({ status: 'yes' }))
//     // const obj = JSON.parse(body);
//     // let id = null;
//     // if (obj.command === 'Create command') {
//     //   id = uuid.v4();
//     //   createInstance(ws, id);
//     // }
//     // if (obj.command === 'Delete command') {
//     //   deleteInstance(ws, obj);
//     // }
//     // if ((obj.command === 'Start command') || (obj.command === 'Pause command')) {
//     //   changeInstance(ws, obj);
//     // }
//     // if (id === null) {
//     //   id = obj.id;
//     // }
//     // ws.send(JSON.stringify({ 
//     //   status: `Received`, 
//     //   data: {
//     //     id,
//     //     command: obj.command,
//     //     time: Date.now(),
//     //   }
//     // }));
//   // });

function sendAllUsers(message, sender) {
	Array.from(wsServer.clients)
		.filter((client) => client.readyState === WS.OPEN)
		.forEach((client) => client.send(message));
}

server.listen(port, (err) => {
  // два аргумента (1-й это порт, 2-й это callback по результатам запуска сервера)
  if (err) { // в callback может быть передана ошибка
    // (выводим её в консоль для примера, если она появится)
    console.log(err);
    return;
  }
  console.log('Server is listening to 9000 port ************************');
});
