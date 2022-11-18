import { MockProvider } from "ethereum-waffle";

export const mineBlocks = async (
  numBlocks: number,
  provider: MockProvider
): Promise<void> => {
  for (let i = 0; i < numBlocks; i++) {
    await provider.send("evm_mine", []);
  }
};
