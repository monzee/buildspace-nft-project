async function main() {
    let MyEpicNFT = await hre.ethers.getContractFactory("MyEpicNFT");
    let nftContract = await MyEpicNFT.deploy();
    await nftContract.deployed();
    console.log("Deployed to", nftContract.address);

    let txn = await nftContract.makeAnEpicNFT();
    await txn.wait();

    txn = await nftContract.makeAnEpicNFT();
    await txn.wait();
}

(async () => {
    try {
        await main();
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
