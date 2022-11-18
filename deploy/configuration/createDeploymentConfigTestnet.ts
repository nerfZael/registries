import { DeploymentConfig } from "../types/DeploymentConfig";

export const createDeploymentConfigTestnet = (
  deployerAddress: string
): DeploymentConfig => ({
  adminAddress: deployerAddress,
});
