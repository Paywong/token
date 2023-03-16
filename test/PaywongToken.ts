import {loadFixture} from "ethereum-waffle";
import {expect} from "chai";
import { ethers } from "hardhat";

describe("Paywong Token Contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("PaywongToken");
        const paywongToken = await factory.deploy();
        await paywongToken.deployed();
        return {owner, addr1, addr2, paywongToken};
    }

    it("Should assign the total supply of tokens to the owner", async function () {
        const {paywongToken, owner} = await loadFixture(deployTokenFixture);
        const ownerBalance = await paywongToken.balanceOf(owner.address);
        console.log('totalSupply', await paywongToken.totalSupply())
        expect(await paywongToken.totalSupply()).to.equal(ownerBalance);
    });
});
