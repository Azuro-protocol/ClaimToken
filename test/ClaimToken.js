const { BigNumber } = require("@ethersproject/bignumber");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const BIGZERO = BigNumber.from(0).toString();
const DAY = 60 * 60 * 24;

function tokens(val) {
  return BigNumber.from(val).mul(BigNumber.from("10").pow(6)).toString();
}

async function getBlockTime(ethers) {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  const time = blockBefore.timestamp;
  return time;
}

async function timeShiftBy(ethers, timeDelta) {
  let time = (await getBlockTime(ethers)) + timeDelta;
  await network.provider.send("evm_setNextBlockTimestamp", [time]);
  await network.provider.send("evm_mine");
}

describe("ClaimToken", function () {
  async function deployClaimTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const ClaimToken = await ethers.getContractFactory("ClaimToken");
    const claimToken = await ClaimToken.deploy("AZURO USDT Test token", "AZUSD");

    return { claimToken, owner, otherAccount };
  }

  describe("Main tests", function () {
    it("Should set the right owner", async function () {
      const { claimToken, owner } = await loadFixture(deployClaimTokenFixture);
      expect(await claimToken.owner()).to.equal(owner.address);
      expect(await claimToken.decimals()).to.equal(6);
    });

    it("Not owner can't mint and burn", async function () {
      const { claimToken, otherAccount } = await loadFixture(deployClaimTokenFixture);
      await expect(claimToken.connect(otherAccount).mint(otherAccount.address, tokens(10000))).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      await expect(claimToken.connect(otherAccount).burn(otherAccount.address, tokens(10000))).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Owner can mint and burn", async function () {
      const { claimToken, owner } = await loadFixture(deployClaimTokenFixture);

      await claimToken.connect(owner).mint(owner.address, tokens(10000));
      expect(await claimToken.balanceOf(owner.address)).to.equal(tokens(10000));

      await claimToken.burn(owner.address, tokens(10000));
      expect(await claimToken.balanceOf(owner.address)).to.equal(BIGZERO);
    });

    it("Tokens can be claimed only once a day", async function () {
      const { claimToken, owner, otherAccount } = await loadFixture(deployClaimTokenFixture);

      await claimToken.connect(otherAccount).claim();
      let dailyLimit = await claimToken.DAILY_CLAIM_LIMIT();
      expect(await claimToken.balanceOf(otherAccount.address)).to.equal(dailyLimit);

      // try claim again
      await expect(claimToken.connect(otherAccount).claim()).to.be.revertedWith("Not available tokens for claim");

      await claimToken.connect(otherAccount).transfer(owner.address, dailyLimit);
      expect(await claimToken.balanceOf(otherAccount.address)).to.equal(BIGZERO);

      // pass 1 day and next try will successfully
      await timeShiftBy(ethers, DAY);
      await claimToken.connect(otherAccount).claim();
      expect(await claimToken.balanceOf(otherAccount.address)).to.equal(dailyLimit);
    });
  });
});
