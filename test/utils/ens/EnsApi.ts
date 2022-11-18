import hre, { ethers } from "hardhat";
import { BytesLike, Signer } from "ethers";
import {
  ENSRegistry,
  TestEthRegistrar,
  TestPublicResolver,
} from "../../../typechain-types";
import { BaseProvider } from "@ethersproject/providers";
import { EnsDomain } from "./EnsDomain";

export const POLYWRAP_OWNER_RECORD_NAME = "polywrap-owner";

export class EnsApi {
  constructor(
    private readonly ensRegistryL1: ENSRegistry,
    private readonly testEthRegistrarL1: TestEthRegistrar,
    private readonly testPublicResolverL1: TestPublicResolver
  ) {}

  async registerDomainName(
    owner: Signer,
    domainOwner: Signer,
    domain: EnsDomain
  ): Promise<void> {
    await this.testEthRegistrarL1
      .connect(owner)
      .addController(await domainOwner.getAddress());

    await this.testEthRegistrarL1
      .connect(domainOwner)
      .register(domain.labelHash, await domainOwner.getAddress(), 10 * 60);

    const ownedRegistry = this.ensRegistryL1.connect(domainOwner);

    await ownedRegistry.setResolver(
      domain.node,
      this.testPublicResolverL1.address
    );
  }

  async setContenthash(
    domainOwner: Signer,
    domain: EnsDomain,
    contenthash: BytesLike
  ): Promise<void> {
    const ownedPublicResolver = this.testPublicResolverL1.connect(domainOwner);

    await ownedPublicResolver.setContenthash(domain.node, contenthash);
  }
}
