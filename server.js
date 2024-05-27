const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('@koa/cors'); // правила политики cors
const delay = require('koa-delay'); // задержка ответа сервера delay(2, 3) 2 - до, 3 - после ответа
const slow = require('koa-slow'); // задержка ответа сервера
const router = require('./routes'); // импортируем набор роутеров по файлу index.js в папке

const app = new Koa();

app.use(koaBody({ // чтобы обработать тело запроса
  // (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

app.use( // задаем правила для политики CORS
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

// app.use(slow({
//   delay: 4000, // задержка ответа сервера
// }));

// app.use(cors()); // задаем правила для политики CORS
// app.use(delay(2000)); // задержка ответа сервера

app.use(router()); // подключаем маршрутизатор

const port = process.env.PORT || 9000;

app.listen(port, (err) => {
  // два аргумента (1-й это порт, 2-й это callback по результатам запуска сервера)
  if (err) { // в callback может быть передана ошибка
    // (выводим её в консоль для примера, если она появится)
    console.log(err);
    return;
  }
  console.log('Server is listening to 9000 port ************************');
});
