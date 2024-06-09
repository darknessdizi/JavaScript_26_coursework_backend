const { v4: uuidv4 } = require('uuid'); // импортируем v4 из uuid и переименовываем как uuidv4
const fs = require('fs');

class DataFiles {
  constructor() {
    this.data = [];
  }

  init() {
    // инициализация класса (проверка наличия или создания файла)
    fs.stat('./public/dataBase.json', (err) => {
      if (err === null) {
        console.log('File dataBase.json exists');
      } else if (err.code === 'ENOENT') {
        // file does not exist
        fs.open('./public/dataBase.json', 'w', (error) => {
          if (error) throw error;
          fs.readFile('./public/dataBase.json', 'utf8', this.initFile.bind(this));
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
      DataFiles.saveFile();
      return null;
    }
    const json = JSON.parse(fileData);
    /* eslint-disable-next-line */
    for (const obj of json.messages) {
      this.data.push(obj);
    }
    return null;
  }

  addData({ type, cords, content } = {}) {
    // Добавляем объект сообщения в общий список
    const result = { type, cords, content };
    result.id = uuidv4();
    result.timestamp = Date.now();
    result.favorite = false;
    this.data.push(result);
    DataFiles.saveFile(this.data);
    return result;
  }

  changeFavorite(id, favorite) {
    // Замена статуса избранного сообщения
    const index = this.data.findIndex((item) => item.id === id);
    this.data[index].favorite = favorite;
    DataFiles.saveFile(this.data);
    return { id, favorite };
  }

  deleteData(id) {
    // Удаляет данные из базы по id
    return new Promise((resolve, reject) => {
      const index = this.data.findIndex((item) => item.id === id);
      if (index) {
        reject(new Error('Файл не найден'));
      }
      const { type } = this.data[index];
      if (type === 'message') {
        const { content } = this.data[index];
        this.data.splice(index, 1);
        DataFiles.saveFile(this.data);
        console.log('Удалено из БД и из файла json');
        resolve({ id, type, content });
      }
      const { path } = this.data[index].content;
      fs.unlink(`./public${path}`, (err) => {
        if (err) {
          console.log('Ошибка удаления файла:', err);
          reject(err);
        }
        if (id === this.data[index].id) {
          this.data.splice(index, 1);
          DataFiles.saveFile(this.data);
          resolve({ id, type });
        }
      });
    });
  }

  static saveFile(data = []) {
    // Сохраняет изменения в файл
    const body = { messages: data };
    const file = JSON.stringify(body, null, 2);
    // Перезаписываем файл:
    fs.writeFileSync('./public/dataBase.json', file);
  }

  getFavorites() {
    // Возвращает все сообщения со статусом избранные
    const result = this.data.filter((item) => item.favorite === true);
    return result;
  }

  getOneMessage(id) {
    // Возвращает сообщение по номеру id
    const result = this.data.find((item) => item.id === id);
    return result;
  }

  getData() {
    // Возвращает список всех сообщений
    return this.data;
  }
}

module.exports = {
  DataFiles,
};
