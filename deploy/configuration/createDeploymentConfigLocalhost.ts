import { DeploymentConfig } from "../types/DeploymentConfig";

export const createDeploymentConfigLocalhost = (
  deployerAddress: string
): DeploymentConfig => ({
  adminAddress: deployerAddress,
});
