const combineRouters = require('koa-combine-routers'); // объединение роутеров

const root = require('./root'); // получаем один из роутеров

const router = combineRouters(
  root, // перечисляем все доступные роутеры
);

module.exports = router;
