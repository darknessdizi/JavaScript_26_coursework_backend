const Router = require('koa-router');
const dataBase = require('../../db');

const router = new Router(); // создали роутер

// router.get('/articles', (ctx) => {
//   console.log('GET запрос на сервер от:', ctx.request.header.referer); // показать url источника запроса

//   ctx.response.status = 200;
//   ctx.response.body = dataBase.getDataBase();  
// });

// router.post('/', (ctx) => {
//   // console.log('POST запрос на сервер от:', ctx.request.header.referer); // показать url источника запроса
//   ctx.websocket.send('Hello World');
//   console.log('POST тело:', ctx.request.body);
//   console.log('POST тело ctx:', ctx);

//   if (ctx.request.body.type === 'message') {
//     ctx.response.body = dataBase.addData(ctx.request.body);
//     ctx.response.status = 200;
//   }
// });

module.exports = router;
