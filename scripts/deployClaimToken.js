const hre = require("hardhat");

async function main() {
  const name = "AZURO USDT Test token";
  const symbol = "AZUSD";
  const claimToken = await hre.ethers.deployContract("ClaimToken", [name, symbol]);
  await claimToken.waitForDeployment();

  console.log("ClaimToken deployed to", claimToken.target);

  try {
    await hre.run("verify:verify", {
      address: claimToken.target,
      constructorArguments: [name, symbol],
    });
  } catch (err) {}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
