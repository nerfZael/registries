import { describe } from "mocha";
import {
  WrapRegistry__factory,
  WrapPublicResolver__factory,
  WrapFIFSRegistrar__factory,
  OnChainRepositoryV1__factory,
  WrapRegistry,
  OnChainRepositoryV1,
} from "../../../typechain-types";
import { Wallet } from "ethers";
import { expect } from "chai";
import { loadFixture, MockProvider } from "ethereum-waffle";
import { ethers } from "hardhat";
import { namehash } from "ethers/lib/utils";
import { encodeOcrIdAsContenthashString } from "@nerfzael/ocr-core";
import { PolywrapClient } from "@polywrap/client-js";
import { ocrResolverPlugin } from "@nerfzael/ocr-resolver-plugin-wrapper";
import { ethereumPlugin } from "@polywrap/ethereum-plugin-js";
import { publishOcrPackage } from "../../utils/publishOcrPackage";
import { labelhash } from "../../../utils/labelhash";
import { EnsApi } from "../../utils/ens/EnsApi";
import { encodeFiles } from "@nerfzael/encoding";
import fs from "fs";
import { JsonRpcProvider } from "@polywrap/client-js/build/pluginConfigs/Ethereum";
import { ENSRegistry__factory } from "../../../typechain-types";
import { TestEthRegistrar__factory } from "../../../typechain-types";
import { TestPublicResolver__factory } from "../../../typechain-types";
import { EnsDomain } from "../../utils/ens/EnsDomain";

const protocolVersion = 1;
const chainId = 1337;

describe("Polywrap OnChainRepositoryV1", () => {
  const loadClient = (provider: MockProvider) => {
    return new PolywrapClient({
      plugins: [
        {
          uri: "wrap://ens/ocr-resolver.eth",
          plugin: ocrResolverPlugin({
            provider: provider,
          }),
        },
        // {
        //   uri: "wrap://ens/ethereum.eth",
        //   plugin: ethereumPlugin({
        //     networks: {
        //       testnet: {
        //         provider: "http://localhost:8545",
        //       },
        //     },
        //     defaultNetwork: "testnet",
        //   }),
        // },
      ],
      interfaces: [
        {
          interface: "wrap://ens/uri-resolver.core.polywrap.eth",
          implementations: ["wrap://ens/ocr-resolver.eth"],
        },
      ],
    });
  };

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

    let ensRegistry = await new ENSRegistry__factory(owner).deploy();
    let testEthRegistrar = await new TestEthRegistrar__factory(owner).deploy(
      ensRegistry.address,
      ethers.utils.namehash("eth")
    );
    let testPublicResolver = await new TestPublicResolver__factory(owner).deploy(ensRegistry.address);

    ensRegistry = ensRegistry.connect(owner);
    testEthRegistrar = testEthRegistrar.connect(owner);
    testPublicResolver = testPublicResolver.connect(owner);

    const rootNode = ethers.utils.zeroPad([0], 32);
    await ensRegistry.setSubnodeOwner(
      rootNode,
      labelhash(EnsDomain.TLD),
      testEthRegistrar.address
    );
    await testEthRegistrar.addController(owner.address);
    await testEthRegistrar.setResolver(testPublicResolver.address);

    const ens = new EnsApi(ensRegistry, testEthRegistrar, testPublicResolver);

    return {
      provider,
      ens,
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

  it("ocr direct", async () => {
    const {
      provider,
      contracts: { repository },
    } = await loadFixture(fixture);

    const client = loadClient(provider);

    const infoBuffer = fs.readFileSync(
      __dirname + "/wrappers/simple/wrap.info"
    );
    const moduleBuffer = fs.readFileSync(
      __dirname + "/wrappers/simple/wrap.wasm"
    );
    const files = [
      {
        path: "wrap.info",
        content: infoBuffer,
      },
      {
        path: "wrap.wasm",
        content: moduleBuffer,
      },
    ];

    const data = encodeFiles(files, 2, 8);

    const ocrId = await publishOcrPackage(
      data,
      protocolVersion,
      chainId,
      repository
    );

    const uri = `wrap://ocr/${ocrId.protocolVersion}/${ocrId.chainId}/${ocrId.contractAddress}/${ocrId.packageIndex}/${ocrId.startBlock}/${ocrId.endBlock}`;

    const { wrapper, uriHistory, error } = await client.resolveUri(uri);

    console.log(uriHistory);
    console.log("error", error);
    expect(!!wrapper).to.be.true;

    const result = await client.invoke({
      uri,
      method: "simpleMethod",
      args: {
        arg: "hello",
      },
    });

    expect(result.error).to.be.undefined;
    expect(!!result.data).to.be.true;
    expect(result.data).to.equal("hello");
  });

  it("ocr through contenthash", async () => {
    const {
      provider,
      contracts: { repository },
    } = await loadFixture(fixture);

    const client = loadClient(provider);

    const infoBuffer = fs.readFileSync(
      __dirname + "/wrappers/simple/wrap.info"
    );
    const moduleBuffer = fs.readFileSync(
      __dirname + "/wrappers/simple/wrap.wasm"
    );

    const files = [
      {
        path: "wrap.info",
        content: infoBuffer,
      },
      {
        path: "wrap.wasm",
        content: moduleBuffer,
      },
    ];

    const data = encodeFiles(files, 2, 8);

    const ocrId = await publishOcrPackage(
      data,
      protocolVersion,
      chainId,
      repository
    );

    const contenthash = encodeOcrIdAsContenthashString(ocrId);
    const uri = `wrap://contenthash/${contenthash}`;

    const { wrapper } = await client.resolveUri(uri);

    expect(!!wrapper).to.be.true;

    const result = await client.invoke({
      uri,
      method: "simpleMethod",
      args: {
        arg: "hello",
      },
    });

    expect(result.error).to.be.undefined;
    expect(!!result.data).to.be.true;
    expect(result.data).to.equal("hello");
  });

  it("ocr through ens", async () => {
    const label = "test";
    const domain = `${label}.eth`;

    const {
      provider,
      ens,
      contracts: { repository, registrar, resolver },
      accounts: { owner, acc1 },
    } = await loadFixture(fixture);

    const infoBuffer = fs.readFileSync(
      __dirname + "/wrappers/simple/wrap.info"
    );
    const moduleBuffer = fs.readFileSync(
      __dirname + "/wrappers/simple/wrap.wasm"
    );

    const files = [
      {
        path: "wrap.info",
        content: infoBuffer,
      },
      {
        path: "wrap.wasm",
        content: moduleBuffer,
      },
    ];

    const data = encodeFiles(files, 2, 8);

    const ocrId = await publishOcrPackage(
      data,
      protocolVersion,
      chainId,
      repository
    );

    const contenthash = encodeOcrIdAsContenthashString(ocrId);
    await ens.registerDomainName(owner, owner, new EnsDomain(domain));
    await ens.setContenthash(owner, new EnsDomain(domain), contenthash);

    const uri = `wrap://wns/testnet/${domain}`;

    const client = loadClient(provider);
    const { wrapper, error } = await client.resolveUri(uri);

    expect(error).to.be.undefined;
    expect(!!wrapper).to.be.true;

    const result = await client.invoke({
      uri,
      method: "simpleMethod",
      args: {
        arg: "hello",
      },
    });

    expect(result.error).to.be.undefined;
    expect(!!result.data).to.be.true;
    expect(result.data).to.equal("hello");
  });
});
