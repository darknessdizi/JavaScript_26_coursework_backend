const { v4: uuidv4 } = require('uuid'); // импортируем v4 из uuid и переименовываем как uuidv4
const fs = require('fs');

class DataFiles {
  constructor() {
    this.data = [];
  }

  init() {
    // инициализация класса
    fs.stat('./public/dataBase.json', (err) => {
      if (err === null) {
        console.log('File dataBase.json exists');
      } else if (err.code === 'ENOENT') {
        // file does not exist
        fs.open('./public/dataBase.json', 'w', (error) => {
          if (error) throw error;
          console.log('File created');
        }); 
      } else {
        console.log('Some other error: ', err.code);
      }
    });

    fs.readFile('./public/dataBase.json', 'utf8', this.initFile.bind(this));
  }

  initFile(error, fileData) {
    // Callback - чтение файла со списком сообщений
    if (error) { // если возникла ошибка
      return console.log(error);
    }
    if (!fileData) { // если файл пустой, создать в нем структуру записей 
      this.saveFile();
    }
    const json = JSON.parse(fileData);
    // /* eslint-disable-next-line */
    for (const obj of json.messages) {
      this.data.push(obj);
    }
    return null;
  }

  addData({ type, cords, content } = {}, file = null) {
    // Добавляем объект сообщения в общий список
    let result = { type, cords, content };
    result.id = uuidv4();
    result.timestamp = Date.now();
    this.data.push(result);
    this.saveFile(this.data); 
    return result;
  }

  saveFile(data = []) {
    // Сохраняет изменения в файл
    const body = { messages: data };
    const file = JSON.stringify(body, null, 2);
    fs.writeFileSync('./public/dataBase.json', file);
  }

  getData() { 
    return this.data;
  }
}

module.exports = {
  DataFiles, 
};
