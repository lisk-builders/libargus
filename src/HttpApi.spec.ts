import { expect } from "chai";

import { HttpApi } from "./HttpApi";

const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodePort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;

describe("HttpApi", () => {
  let api: HttpApi;

  beforeEach(() => {
    api = new HttpApi(nodeHostname, nodePort, nodeSecure);
  });

  it("can get node status", async () => {
    const status = await api.getNodeStatus();
    expect(status.data.broadhash).to.match(/^[0-9a-f]{64}$/);
    expect(status.data.consensus).to.be.gt(0);
    expect(status.data.consensus).to.be.lte(100);
    expect(status.data.height).to.be.gt(1);
    expect(status.data.height).to.be.lt(10_000_000);
    expect(status.data.networkHeight).to.be.gt(1);
    expect(status.data.networkHeight).to.be.lt(10_000_000);
    expect(status.data.loaded).to.be.true;
    expect(status.data.syncing).to.be.false;
    expect(status.data.transactions).to.be.not.undefined;
  });

  it("can get forging status", done => {
    // not whitelisted :(
    api
      .getForgingStatus()
      .then(() => done("must not resolve"))
      .catch(error => {
        expect(error).to.match(/403 - {"message":"Access Denied"}/i);
        done();
      });
  });

  it("can get blocks", async () => {
    const response = await api.getBlocks();
    expect(response.data.length).to.equal(100);
    for (const block of response.data) {
      expect(block.id).to.match(/^[0-9]+$/);
      expect(block.height).to.be.within(1, 10_000_000);
      expect(block.generatorPublicKey).to.match(/^[0-9a-f]{64}$/);
    }
  });

  it("can get forgers", async () => {
    const response = await api.getForgers();
    expect(response.data.length).to.equal(100);
    for (const forger of response.data) {
      expect(forger.username).to.match(/^[a-zA-Z0-9_\.]+$/);
      expect(forger.publicKey).to.match(/^[0-9a-f]{64}$/);
    }
  });

  it("can get delegates", async () => {
    const response = await api.getDelegates();
    expect(response.data.length).to.equal(101);
    for (const delegate of response.data) {
      expect(delegate.rank).to.be.within(1, 101);
      expect(delegate.username).to.match(/^[a-zA-Z0-9_\.]+$/);
      expect(delegate.producedBlocks).to.gte(0);
      expect(delegate.missedBlocks).to.gte(0);
      expect(delegate.productivity).to.be.within(0, 100);
    }
  });

  it("can get last block by delegate", async () => {
    const response = await api.getDelegates();
    const firstDelegate = response.data[0];

    const lastBlock = await api.getLastBlockByDelegate(firstDelegate.account.publicKey);
    expect(lastBlock.id).to.match(/^[0-9]+$/);
    expect(lastBlock.height).to.be.within(1, 10_000_000);
    expect(lastBlock.generatorPublicKey).to.eql(firstDelegate.account.publicKey);
  });

  it("can get block by height", async () => {
    const block = await api.getBlockByHeight(1);

    expect(block.id).to.match(/^[0-9]+$/);
    expect(block.height).to.be.within(1, 10_000_000);
    expect(block.generatorPublicKey).to.match(/^[0-9a-f]{64}$/);
  });
});
