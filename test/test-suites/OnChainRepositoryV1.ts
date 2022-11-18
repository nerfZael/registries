import { describe } from "mocha";
import {
  WrapRegistry__factory,
  WrapPublicResolver__factory,
  WrapFIFSRegistrar__factory,
  OnChainRepositoryV1__factory,
  WrapRegistry,
  OnChainRepositoryV1,
} from "../../typechain-types";
import { BigNumber, Wallet } from "ethers";
import { expect } from "chai";
import { loadFixture, MockProvider } from "ethereum-waffle";
import { ethers } from "hardhat";
import { arrayify, BytesLike, concat, namehash } from "ethers/lib/utils";
import { labelhash } from "../../utils/labelhash";
import {
  OcrId,
  encodeOcrIdAsContenthash,
  decodeOcrIdFromContenthash,
} from "@nerfzael/ocr-core";
import { publishOcrPackage } from "../utils/publishOcrPackage";

const protocolVersion = 1;
const chainId = 1337;

describe("OnChainRepositoryV1", () => {
  const fixture = async (
    [owner, acc1, acc2]: Wallet[],
    provider: MockProvider
  ) => {
    let registry: WrapRegistry = await new WrapRegistry__factory(owner).deploy(
      owner.address
    );

    let resolver = await new WrapPublicResolver__factory(owner).deploy(
      registry.address
    );

    let registrar = await new WrapFIFSRegistrar__factory(owner).deploy(
      registry.address,
      ethers.utils.namehash("dev.wrap"),
      resolver.address
    );

    let repository: OnChainRepositoryV1 =
      await new OnChainRepositoryV1__factory(owner).deploy();

    registry = registry.connect(owner);
    resolver = resolver.connect(owner);
    registrar = registrar.connect(owner);
    repository = repository.connect(owner);

    await registry.setSubnodeOwner(
      ethers.constants.HashZero,
      labelhash("wrap"),
      owner.address
    );

    await registry.setSubnodeOwner(
      namehash("wrap"),
      labelhash("dev"),
      registrar.address
    );

    return {
      provider,
      contracts: {
        registry,
        resolver,
        registrar,
        repository,
      },
      accounts: {
        owner,
        acc1,
        acc2,
      },
    };
  };

  it("can get protocol version", async () => {
    const {
      contracts: { repository },
    } = await loadFixture(fixture);

    const protocolVersion = await repository.protocolVersion();

    expect(protocolVersion).to.equal(BigNumber.from(1));
  });

  it("can publish package", async () => {
    const {
      contracts: { registrar, repository },
      accounts: { acc1 },
    } = await loadFixture(fixture);

    const acc1Registrar = registrar.connect(acc1);
    await acc1Registrar.register(labelhash("test"), acc1.address);

    const ocrId = await publishOcrPackage(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7]),
      protocolVersion,
      chainId,
      repository
    );

    const data = await repository.queryFilter(
      repository.filters.PackagePart(),
      ocrId.startBlock,
      ocrId.endBlock
    );
  });

  it("can point wns domain to package id", async () => {
    const {
      contracts: { resolver, registrar, repository },
      accounts: { acc1 },
    } = await loadFixture(fixture);

    const label = "test";
    const domain = `${label}.dev.wrap`;

    const acc1Registrar = registrar.connect(acc1);
    await acc1Registrar.register(labelhash("test"), acc1.address);

    const ocrId = await publishOcrPackage(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7]),
      protocolVersion,
      chainId,
      repository
    );

    const contenthash = encodeOcrIdAsContenthash(ocrId);

    const acc1Resolver = resolver.connect(acc1);

    await acc1Resolver.setContenthash(
      ethers.utils.namehash(domain),
      contenthash
    );

    const savedContenthash = await acc1Resolver.contenthash(
      ethers.utils.namehash(domain)
    );

    const result = decodeOcrIdFromContenthash(savedContenthash);

    expect(!!result).to.be.true;

    if (!result) {
      return;
    }

    const { packageIndex: savedIndex, protocolVersion: savedProtocolVersion } =
      result;

    expect(savedIndex).to.equal(ocrId.packageIndex);
    expect(savedProtocolVersion).to.equal(protocolVersion);
  });
});
