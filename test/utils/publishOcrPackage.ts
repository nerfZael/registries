import { OcrId } from "@nerfzael/ocr-core";
import { expect } from "chai";
import { OnChainRepositoryV1 } from "../../typechain-types";

export const publishOcrPackage = async (
  data: Uint8Array,
  protocolVersion: number,
  chainId: number,
  repository: OnChainRepositoryV1
): Promise<OcrId> => {
  const part1 = data.slice(0, data.length / 2);
  const part2 = data.slice(data.length / 2, data.length);

  const tx = await repository.startPublish(part1, false);
  const receipt = await tx.wait();
  const event = receipt.events ? receipt.events[0] : undefined;
  const packageIndex: number = event?.args?.packageIndex.toNumber();
  expect(packageIndex).to.equal(1);

  await repository.publishPart(packageIndex, part2, true);
  const packageInfo = await repository.package(packageIndex);

  return {
    protocolVersion,
    chainId,
    contractAddress: repository.address,
    packageIndex,
    startBlock: packageInfo.startBlock.toNumber(),
    endBlock: packageInfo.endBlock.toNumber(),
  } as OcrId;
};
