async function main() {
    let MyEpicNFT = await hre.ethers.getContractFactory("MyEpicNFT");
    let contract = await MyEpicNFT.deploy();
    await contract.deployed();
    return contract.address;
}

main().then(console.log).catch((e) => {
    console.error(e);
    process.exit(1);
});
