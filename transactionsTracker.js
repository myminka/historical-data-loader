const { ethers } = require("ethers");

// Подключаемся к провайдеру Ethereum
const provider = new ethers.JsonRpcProvider("https://eth-pokt.nodies.app");

// Адрес нулевого адреса (для проверки на minting)
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

// Функция для обработки транзакций в блоке
async function processBlock(blockNumber) {
    console.log(`Найден новый блок: ${blockNumber}`);

    const block = await provider.getBlock(blockNumber, true);
    let blockPayload = [];

    if (block){
        blockPayload = block.prefetchedTransactions;
    }

    blockPayload.forEach(transaction => {
        console.log(transaction.from);
        if (transaction.from === NULL_ADDRESS){
            console.log(`Был сминчен токен на кошелек ${transaction.to}`);
            console.log(transaction);
        }
    })
}

// Подписываемся на новые блоки
provider.on("block", async (blockNumber) => {
    await processBlock(blockNumber);
});
