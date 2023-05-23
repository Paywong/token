import {LedgerSigner} from "@anders-t/ethers-ledger";
import {ethers, network} from "hardhat";
import {PaywongToken__factory, IMulticall3__factory} from "../typechain-types";
import Decimals from "decimal.js";
import {Multicall3} from "../typechain-types/externalAbis/IMulticall3";
import csvUser from "./airdrop-users.json";
import {BigNumber} from "ethers";

interface User {
    address: string;
    amount: string;
    rawAmount: string;
}

const tokenContacts: {
    [chainId: number]: string;
} = {
    56: "0x383E64ac8808DCE10a39f0DDA8a0484F44E68f5a", // BSC Mainnet
    97: "", // BSC Testnet
};

const Multicall3Address = "0xcA11bde05977b3631167028862bE2a173976CA11";

const main = async () => {
    const chainId = network.config.chainId;
    const tokenAddress = tokenContacts[chainId!];
    const ledger = new LedgerSigner(ethers.provider);
    console.log("Airdrop token on chainId:", chainId);

    console.log("Load users....");

    const users: User[] = csvUser.map((u) => {
        const amount = BigNumber.from(u.Tokens.replace("PWG", "").trim());
        return {
            address: u.PublicAddress__1,
            amount: amount.toString(),
            rawAmount: amount.mul(BigNumber.from(10).pow(18)).toString(),
        };
    });

    const totalAmount = users.reduce((acc, u) => acc.add(BigNumber.from(u.rawAmount)), BigNumber.from(0)).toString();

    console.log("Total amount to airdrop:", ethers.utils.formatEther(totalAmount));
    console.log("Total users:", users.length);

    console.log("Connect to Ledger wallet....");
    console.log("Ledger address ", await ledger.getAddress());
    console.log("Ledger chainId ", await ledger.getChainId());

    const token = PaywongToken__factory.connect(tokenAddress, ledger);
    const multicall3 = IMulticall3__factory.connect(Multicall3Address, ledger);

    const calls: Multicall3.Call3Struct[] = users.map((u) => ({
        target: tokenAddress,
        allowFailure: false,
        callData: token.interface.encodeFunctionData("transfer", [u.address, u.rawAmount]),
    }));

    const gasPrice = await ethers.provider.getGasPrice();

    const gasLimit = await multicall3.estimateGas.aggregate3(calls, {
        gasPrice,
    });

    const gasFee = new Decimals(gasLimit.toString()).mul(gasPrice.toString()).toString();

    console.log("gasLimit", gasLimit.toString());
    console.log("gasPrice", ethers.utils.formatUnits(gasPrice, "gwei"));
    console.log("gasFee", ethers.utils.formatEther(gasFee));

    const tx = await multicall3.aggregate3(calls, {
        gasPrice,
        gasLimit,
    });

    console.log("tx", tx.hash);
    console.log("waiting for tx to be mined...");
    await tx.wait();
    console.log("tx mined");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
