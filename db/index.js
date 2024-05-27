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
      this.data.push(result);
      return result;
    }
  },

  getData() {
    return this.data;
  },
};

module.exports = dataBase;
