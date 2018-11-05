import { expect } from "chai";

import { OwnNodeOptions, Peer, PeerOptions, PeerState } from "./Peer";
import { makeNonce } from "./util/nonce";

const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodeHttpPort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeWsPort = Number.parseInt(process.env.LISK_NODE_WSPORT || "7001", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;

describe("Peer", () => {
  let ownNode: OwnNodeOptions;

  beforeEach(() => {
    ownNode = {
      nonce: makeNonce(),
      os: "linux",
      version: "1.1.1",
      httpPort: 3000,
      wsPort: 3001,
    };
  });

  it("can be constructed", () => {
    const options: PeerOptions = {
      // https://github.com/LiskHQ/lisk/blob/1.1.1/config/testnet/config.json
      ip: "94.237.29.221",
      httpPort: 7000,
      wsPort: 7001,
      nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
      nonce: "",
    };
    const peer = new Peer(options, ownNode);
    expect(peer).not.to.be.undefined;
    peer.destroy();
  });

  it("connects automatically after 2 seconds", done => {
    const options: PeerOptions = {
      // https://github.com/LiskHQ/lisk/blob/1.1.1/config/testnet/config.json
      ip: "94.237.29.221",
      httpPort: 7000,
      wsPort: 7001,
      nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
      nonce: "",
    };
    const peer = new Peer(options, ownNode);
    expect(peer.state).to.eql(PeerState.Offline);

    setTimeout(() => {
      try {
        expect(peer.state).to.eql(PeerState.Online);
        expect(peer.httpActive).to.be.false;
        done();
      } catch (error) {
        done(error);
      } finally {
        peer.destroy();
      }
    }, 2500);
  }).timeout(3000);
});
