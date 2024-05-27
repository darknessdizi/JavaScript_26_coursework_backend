const { v4: uuidv4 } = require('uuid');

const dataBase = {
  data: [],

  addData(obj) {
    // Добавляем объект сообщения в общий список
    if (obj.type === 'message') {
      const result = {
        id: uuidv4(),
        timestamp: Date.now(),
        ...obj,
      }
      console.log('result', result);
      this.data.push(result);
      return result;
    }
  },
};

module.exports = dataBase;
