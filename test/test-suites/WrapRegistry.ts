import { describe } from "mocha";
import {
  WrapRegistry__factory,
  WrapPublicResolver__factory,
  WrapFIFSRegistrar__factory,
  WrapRegistry,
  WrapPublicResolver,
} from "../../typechain-types";
import { Wallet } from "ethers";
import { expect } from "chai";
import { loadFixture, MockProvider } from "ethereum-waffle";
import { ethers } from "hardhat";
import { namehash } from "ethers/lib/utils";
import { labelhash } from "../../utils/labelhash";
const contentHash = require("content-hash");

describe("WrapRegistry", () => {
  const fixture = async (
    [owner, acc1, acc2]: Wallet[],
    provider: MockProvider
  ) => {
    let registry: WrapRegistry = await new WrapRegistry__factory(owner).deploy(
      owner.address
    );

    let resolver: WrapPublicResolver = await new WrapPublicResolver__factory(
      owner
    ).deploy(registry.address);

    let registrar = await new WrapFIFSRegistrar__factory(owner).deploy(
      registry.address,
      ethers.utils.namehash("dev.wrap"),
      resolver.address
    );

    registry = registry.connect(owner);
    resolver = resolver.connect(owner);
    registrar = registrar.connect(owner);

    return {
      provider,
      contracts: {
        registry,
        resolver,
        registrar,
      },
      accounts: {
        owner,
        acc1,
        acc2,
      },
    };
  };

  it("can set contenthash", async () => {
    const {
      contracts: { registry, resolver, registrar },
      accounts: { acc1, owner },
    } = await loadFixture(fixture);

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

    expect(await registry.owner(namehash("dev.wrap"))).to.equal(
      registrar.address
    );

    const label = "test";
    const domain = `${label}.dev.wrap`;
    const cid = "QmcvGHtW7r3RaTzVNJtFCFFPNCUF7F3vgEZZANPTzaG6LS";
    const contenthash = "0x" + contentHash.fromIpfs(cid);

    const acc1Registrar = registrar.connect(acc1);
    await acc1Registrar.register(labelhash("test"), acc1.address);

    const acc1Resolver = resolver.connect(acc1);
    await acc1Resolver.setContenthash(
      ethers.utils.namehash(domain),
      contenthash
    );

    const savedContenthash = await acc1Resolver.contenthash(
      ethers.utils.namehash(domain)
    );

    expect(savedContenthash).to.equal(contenthash);

    // await expect(sprouter.setPlantingActive(true))
    //   .to.emit(sprouter, "PlantingActiveChange")
    //   .withArgs(true);

    // expect(await sprouter.plantingActive()).to.equal(true);
  });
});
