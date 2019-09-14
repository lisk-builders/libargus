"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Peer_1 = require("./Peer");
const nonce_1 = require("./util/nonce");
const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodeHttpPort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeWsPort = Number.parseInt(process.env.LISK_NODE_WSPORT || "7001", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;
describe("Peer", () => {
    let ownNode;
    beforeEach(() => {
        ownNode = {
            nonce: nonce_1.makeNonce(),
            os: "linux",
            version: "1.1.1",
            httpPort: 3000,
            wsPort: 3001,
            protocolVersion: "1.1"
        };
    });
    it("can be constructed", () => {
        const options = {
            // https://github.com/LiskHQ/lisk/blob/1.1.1/config/testnet/config.json
            ip: "94.237.29.221",
            httpPort: 7000,
            wsPort: 7001,
            nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
        };
        const peer = new Peer_1.Peer(options, ownNode);
        chai_1.expect(peer).not.to.be.undefined;
        peer.destroy();
    });
    it("connects automatically after 2 seconds", done => {
        const options = {
            // https://github.com/LiskHQ/lisk/blob/1.1.1/config/testnet/config.json
            ip: "94.237.29.221",
            httpPort: 7000,
            wsPort: 7001,
            nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
        };
        const peer = new Peer_1.Peer(options, ownNode);
        chai_1.expect(peer.state).to.eql(Peer_1.PeerState.Offline);
        setTimeout(() => {
            try {
                chai_1.expect(peer.state).to.eql(Peer_1.PeerState.Online);
                chai_1.expect(peer.httpActive).to.be.false;
                done();
            }
            catch (error) {
                done(error);
            }
            finally {
                peer.destroy();
            }
        }, 2500);
    }).timeout(3000);
});
//# sourceMappingURL=Peer.spec.js.map