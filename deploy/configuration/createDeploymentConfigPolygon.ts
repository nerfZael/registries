import { DeploymentConfig } from "../types/DeploymentConfig";

export const createDeploymentConfigPolygon = (
  deployerAddress: string
): DeploymentConfig => ({
  adminAddress: deployerAddress,
});
