import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { createDeploymentConfigLocalhost } from "../../configuration/createDeploymentConfigLocalhost";
import { ethers } from "hardhat";
import { labelhash } from "../../../utils/labelhash";
import { WrapRegistry__factory } from "../../../typechain-types";
import { namehash } from "ethers/lib/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;
  const signer = await ethers.getSigner(deployer);

  const deploymentConfig = createDeploymentConfigLocalhost(deployer);

  const registryDeployment = await deploy("WrapRegistry", {
    contract: "WrapRegistry",
    from: deployer,
    args: [deployer],
    log: true,
  });

  const resolverDeployment = await deploy("WrapPublicResolver", {
    contract: "WrapPublicResolver",
    from: deployer,
    args: [registryDeployment.address],
    log: true,
  });

  const registrarDeployment = await deploy("WrapFIFSRegistrar", {
    contract: "WrapFIFSRegistrar",
    from: deployer,
    args: [
      registryDeployment.address,
      ethers.utils.namehash("dev.wrap"),
      resolverDeployment.address,
    ],
    log: true,
  });

  await deploy("OnChainRepositoryV1", {
    contract: "OnChainRepositoryV1",
    from: deployer,
    args: [],
    log: true,
  });

  const registry = WrapRegistry__factory.connect(
    registryDeployment.address,
    signer
  );
  await registry.setSubnodeOwner(
    ethers.utils.zeroPad([0], 32),
    labelhash("wrap"),
    deployer
  );

  await registry.setSubnodeOwner(
    namehash("wrap"),
    labelhash("dev"),
    registrarDeployment.address
  );

  await registry.setSubnodeOwner(
    ethers.utils.zeroPad([0], 32),
    labelhash("wrap"),
    deploymentConfig.adminAddress
  );

  return !useProxy;
};
export default func;
func.id = "deploy";
func.tags = ["all"];
