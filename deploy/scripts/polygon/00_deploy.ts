import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { createDeploymentConfigPolygon } from "../../configuration/createDeploymentConfigPolygon";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const useProxy = !hre.network.live;

  const deploymentConfig = createDeploymentConfigPolygon(deployer);

  await deploy("WrapRegistry", {
    contract: "WrapRegistry",
    from: deployer,
    args: [deploymentConfig.adminAddress],
    log: true,
  });

  return !useProxy;
};
export default func;
func.id = "deploy_deploy";
func.tags = ["all"];
