import {LedgerSigner} from "@anders-t/ethers-ledger";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import {ethers, network} from "hardhat";
import {PaywongToken__factory} from "../typechain-types";

const main = async () => {
    const chainId = network.config.chainId;
    console.log("Deploy token on chainId:", chainId);
    let contractFactory = (await ethers.getContractFactory("PaywongToken")) as PaywongToken__factory;
    // local network
    if (chainId === 31337) {
        const [deployer] = await ethers.getSigners();
        console.log("Deployer address:", deployer.address);
        contractFactory = contractFactory.connect(deployer);
    } else {
        console.log("Connect to Ledger wallet....");
        const ledger = new LedgerSigner(ethers.provider);
        console.log("Ledger address ", await ledger.getAddress());
        console.log("Ledger chainId ", await ledger.getChainId());
        contractFactory = contractFactory.connect(ledger);
    }

    const paywongToken = await contractFactory.deploy();
    console.log("PaywongToken deploying...", paywongToken.deployTransaction.hash);
    await paywongToken.deployed();
    console.log("PaywongToken deployed to:", paywongToken.address);
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
