import { expect } from "chai";

import { WsApi } from "./LiskClient";
import { makeNonce } from "./util/nonce";

const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodeHttpPort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeWsPort = Number.parseInt(process.env.LISK_NODE_WSPORT || "7001", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;

describe("WsApi", () => {
  let ownNode: object;

  beforeEach(() => {
    ownNode = {
      nonce: makeNonce(),
      nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
      version: "1.1.1",
      os: "linux",
      height: 500,
      wsPort: 7001,
      httpPort: 7000,
    };
  });

  it("can be constructed", () => {
    const wsApi = new WsApi(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
    expect(wsApi).not.to.be.undefined;
  });

  it("can get status via websocket", done => {
    const wsApi = new WsApi(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
    wsApi.connect(
      async () => {
        try {
          const status = await wsApi.getStatus();
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
          wsApi.destroy();
        }
      },
      () => {},
      error => {
        throw new Error(error);
      },
    );
  });

  it("can get peers via websocket", done => {
    const wsApi = new WsApi(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
    wsApi.connect(
      async () => {
        try {
          const response = await wsApi.getPeers();
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
          wsApi.destroy();
        }
      },
      () => {},
      error => {
        throw new Error(error);
      },
    );
  });
});
