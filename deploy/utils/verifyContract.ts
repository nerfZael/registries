import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployResult } from "hardhat-deploy/types";

export const verifyContract = async (
  hre: HardhatRuntimeEnvironment,
  deployment: DeployResult,
  constructorArguments: any[],
  confirmationsToWait: number,
  contract?: string
): Promise<void> => {
  const { deployer } = await hre.getNamedAccounts();
  const signer = await ethers.getSigner(deployer);

  await signer.provider?.waitForTransaction(
    deployment.receipt?.transactionHash as string,
    confirmationsToWait
  );

  try {
    await hre.run("verify:verify", {
      contract: contract,
      address: deployment.address,
      constructorArguments: constructorArguments,
    });
  } catch (ex) {
    console.error(ex);
  }
};
