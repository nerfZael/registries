import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { createDeploymentConfigTestnet } from "../../configuration/createDeploymentConfigTestnet";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;

  const deploymentConfig = createDeploymentConfigTestnet(deployer);

  await deploy("OnChainRepositoryV1", {
    contract: "OnChainRepositoryV1",
    from: deployer,
    args: [],
    log: true,
  });

  return !useProxy;
};
export default func;
func.id = "deploy_OnChainRepositoryV1";
func.tags = ["all"];
