const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors'); // правила политики cors
const koaStatic = require('koa-static');
const path = require('path');
// const router = require('./routes'); // импортируем набор роутеров по файлу index.js в папке
const Router = require('koa-router');
const http = require('http');
const WS = require('ws'); // сервер для WebSocket от клиентов
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // импортируем v4 из uuid и переименовываем как uuidv4
const { DataFiles } = require('./db');

function sendAllUsers(message) {
  // Отпрвка сообщений через WS всем подключенным клиентам
	Array.from(wsServer.clients)
		.filter((client) => client.readyState === WS.OPEN)
		.forEach((client) => client.send(message));
}

function upLoadFile(file, body) {
  return new Promise((resolve) => {
    const reader$ = fs.createReadStream(file.path); // Create-readable stream
    const ext = file.name.split('.').pop(); // Get upload the file extension
    const [ type ] = file.type.split('/'); // получаем первое значение из списка

    const nameFile = `${type}.${uuidv4()}.${ext}`;
    const upStream = fs.createWriteStream(`public/${nameFile}`);
    reader$.pipe(upStream);

    upStream.addListener('close', () => {
      console.log('Завершен поток +++++++ upStream +++++++');

      body.type = type;
      body.content = {
        name: nameFile,
        originalName: file.name,
        path: `/${nameFile}`,
      };

      const result = dataBase.addData(body);
      resolve(result);
    })
  })
}

const dataBase = new DataFiles();
dataBase.init();

const app = new Koa();

const public = path.join(__dirname, '/public/');
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
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
  }),
);

const router = new Router(); // создали роутер
app.use(router.routes());
// app.use(router()); // подключаем маршрутизатор

const port = process.env.PORT || 9000;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({
  server
});

router.post('/message', (ctx) => {
  // console.log('POST запрос /message от:', ctx.request.header.referer); // показать url источника запроса
  console.log('POST /message тело:', ctx.request.body);
  const result = [];
  const obj = dataBase.addData(ctx.request.body);
  result.push(obj);
  ctx.response.status = 200;
  sendAllUsers(JSON.stringify(result));
});

router.patch('/favorite/:id', (ctx) => {
  console.log('PATCH /favorite тело:', ctx.request.body);
  console.log('Параметры', ctx.params)
  const { favorite } = JSON.parse(ctx.request.body);
  const { id } = ctx.params;
  const obj = {
    status: 'changeFavorite',
    result: dataBase.changeFavorite(id, favorite),
  };
  ctx.response.status = 200;
  sendAllUsers(JSON.stringify(obj));
});

router.delete('/delete/:id', async (ctx) => {
  console.log('PATCH /delete Параметры', ctx.params)
  const { id } = ctx.params;
  const obj = {
    status: 'deleteMessage',
    result: await dataBase.deleteData(id),
  };
  console.log("Удаление объекта", obj);
  ctx.response.status = 200;
  sendAllUsers(JSON.stringify(obj));
});

router.post('/upload', async (ctx) => {
  console.log('POST /upload тело:', ctx.request.body);
  const { body } = ctx.request;
  const { file } = ctx.request.files;

  const result = [];
  if (file.length) {
    for (let i = 0; i < file.length; i += 1) {
      const obj = await upLoadFile(file[i], body);
      result.push(obj);
    }
  } else {
    const obj = await upLoadFile(file, body);
    result.push(obj);
  }

  console.log('Маршрут unload - сейчас будет ответ клиенту');
  ctx.response.status = 200;
  sendAllUsers(JSON.stringify(result));
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
