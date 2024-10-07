const { MongoClient } = require('mongodb');

// Подключение к MongoDB
const url = 'mongodb://localhost:27017'; // Укажите путь к вашему MongoDB
const dbName = 'eth_transactions'; // Название базы данных
let db, client;

async function connectToDatabase() {
    try {
        client = new MongoClient(url);
        await client.connect();
        console.log('Успешное подключение к MongoDB');
        db = client.db(dbName);
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        throw error;
    }
}

// Функция для создания новой коллекции и записи данных
async function logTransactionsInDb(collectionName, transactions) {
    try {
        const collection = db.collection(collectionName);
        if (collection !== null){
            transactions.forEach(async transaction => {
                await collection.insertOne(transaction);
                console.log(`Логгировано событие: from=${transaction.from}, to=${transaction.to}, value=${transaction.amount}`);
            });
        }
    } catch (error) {
        console.error('Ошибка при логировании события в MongoDB:', error);
        throw error;
    }
}

// Функция закрытия подключения к базе данных
async function closeConnection() {
    if (client) {
        await client.close();
        console.log('Подключение к MongoDB закрыто');
    }
}

// Экспортируем функции для использования в других файлах
module.exports = {
    connectToDatabase,
    logTransactionsInDb,
    closeConnection
};