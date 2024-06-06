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
      this.saveFile();
      return null;
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
    result.favorite = false;
    this.data.push(result);
    this.saveFile(this.data); 
    return result;
  }

  changeFavorite(id, favorite) {
    // Замена статуса избранного сообщения
    const index = this.data.findIndex((item) => item.id === id);
    this.data[index].favorite = favorite;
    this.saveFile(this.data);
    return { id: id, favorite: favorite }
  }

  deleteData(id) {
    // Удаляет данные из базы по id
    return new Promise((resolve, reject) => {
      const index = this.data.findIndex((item) => item.id === id);
      console.log('Удаляем', id, 'index', index);
      if (this.data[index].type === 'message') {
        console.log('message content', this.data[index].content, 'удаляется');
        this.data.splice(index, 1);
        this.saveFile(this.data);
        console.log('Удалено из БД и из файла json');
        return resolve({ id });
      }
      const { path } = this.data[index].content;
      console.log('Удаляем файл:', path);
      fs.unlink(`./public${path}`, (err) => {
        if (err) {
          console.log('Ошибка удаления файла:', err);
          return reject(err);
        }
        // console.log('Файл', this.data[index].content.name, 'удален !!!');
        this.data.splice(index, 1);
        this.saveFile(this.data);
        return resolve({ id });
      });
    });
  }

  saveFile(data = []) {
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

  getData() { 
    return this.data;
  }
}

module.exports = {
  DataFiles, 
};
