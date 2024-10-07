const { ethers } = require('ethers');
const { connectToDatabase, logTransactionsInDb, closeConnection } = require('./logger');
const readline = require('readline');

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, answer => {
        rl.close();
        resolve(answer);
    }));
}

// Функция для получения первых 100 событий Transfer
async function getHistoricalTransfers(provider, tokenContract, tokenAddress, skipTransactions = 0, takeTransactions = 100) {

    const filter = {
        address: tokenAddress,
        topics: [
            ethers.id("Transfer(address,address,uint256)"),
        ],
        fromBlock: 0,
        toBlock: 'latest'
    };

    var transfers = [];

    try {
        // Получаем события Transfer начиная с нулевого блока до текущего
        const logs = await provider.getLogs(filter);

        // Берем первые 100 событий
        let transactionNumber = skipTransactions;
        transfers = logs.slice(skipTransactions, skipTransactions + takeTransactions).map((log) => {
            const parsedLog = tokenContract.interface.parseLog(log);

            transactionNumber++;

            return {
                transactionOrder: transactionNumber, 
                from: parsedLog.args.from,
                to: parsedLog.args.to,
                amount: ethers.formatUnits(parsedLog.args.value, 9),
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber
            }
        });

        // Выводим данные о транзакциях
        transfers.forEach((transfer, index) => {
            console.log(`Transfer #${index + 1}:`);
            console.log(`Transaction order #${transfer.transactionOrder}:`)
            console.log(`From: ${transfer.from}`);
            console.log(`To: ${transfer.to}`);
            console.log(`Amount: ${transfer.amount} SATOSHI`);
            console.log(`Transaction Hash: ${transfer.transactionHash}`);
            console.log(`Block Number: ${transfer.blockNumber}`);
            console.log('--------------------------------');
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }

    return transfers;
}

async function main(){
    // Указываем адрес вашего токена
    const tokenAddress = '0x8b9D9C3f0693EFa2B60d464879f0183Afa03c514';

    // ABI токена, необходимое для работы с событиями
    const tokenABI = [
        "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];

    try{
        // Получаем название коллекции от пользователя
        const collectionName = await askQuestion('Введите имя новой коллекции: ');

        // Подключаемся к Ethereum через RPC-провайдер
        const provider = new ethers.JsonRpcProvider('https://eth-pokt.nodies.app');

        // Создаем объект контракта
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

        // Вызов функции
        const transactions = await getHistoricalTransfers(provider, tokenContract, tokenAddress, 0, 5);

        // Подключаемся к MongoDB
        await connectToDatabase();

        //add logging

        await logTransactionsInDb(collectionName, transactions);
    }
    catch(error){
        console.log(error);
    }
    finally{
        // Закрываем подключение к базе данных
        //await closeConnection();
    }
}

main();