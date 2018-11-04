import { expect } from "chai";

import { LiskClient } from "./LiskClient";

const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodeHttpPort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeWsPort = Number.parseInt(process.env.LISK_NODE_WSPORT || "7001", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;

describe("LiskClient", () => {
  const ownNode = {
    nonce: "g3f97g230fz6dh23",
    nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
    version: "1.1.1",
    os: "linux",
    height: 500,
    wsPort: 7001,
    httpPort: 7000,
  };

  it("can be constructed", () => {
    const client = new LiskClient(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
    expect(client).not.to.be.undefined;
  });

  it("can get status via websocket", done => {
    const client = new LiskClient(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
    client.connect(
      async () => {
        try {
          const status = await client.getStatus();
          expect(status.success).to.be.true;
          expect(status.os).to.match(/^linux4/);
          expect(status.httpPort).to.eql(nodeHttpPort);
          expect(status.height).to.be.within(1, 10_000_000);
          expect(status.broadhash).to.match(/^[0-9a-f]{64}$/);
          expect(status.version).to.match(/^1\.2\.[0-9]+-rc.[0-9]+$/);
          expect(status.nonce).to.match(/^[0-9a-zA-Z]{16,30}$/);
          done();
        } catch (error) {
          done(error);
        } finally {
          client.destroy();
        }
      },
      () => {},
      error => {
        throw new Error(error);
      },
    );
  });

  it("can get peers via websocket", done => {
    const client = new LiskClient(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
    client.connect(
      async () => {
        try {
          const response = await client.getPeers();
          expect(response.success).to.be.true;
          expect(response.peers.length).to.be.within(3, 100);
          for (const peer of response.peers) {
            expect(peer.nonce).to.match(/^[0-9a-zA-Z]{16,30}$/);
            expect(peer.ip).to.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/);
            expect(peer.wsPort).to.be.within(0, 65535);
          }
          done();
        } catch (error) {
          done(error);
        } finally {
          client.destroy();
        }
      },
      () => {},
      error => {
        throw new Error(error);
      },
    );
  });
});
