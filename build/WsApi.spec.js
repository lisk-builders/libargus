"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const nonce_1 = require("./util/nonce");
const WsApi_1 = require("./WsApi");
const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodeHttpPort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeWsPort = Number.parseInt(process.env.LISK_NODE_WSPORT || "7001", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;
describe("WsApi", () => {
    let ownNode;
    beforeEach(() => {
        ownNode = {
            nonce: nonce_1.makeNonce(),
            nethash: "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba",
            version: "1.1.1",
            os: "linux",
            height: 500,
            wsPort: 7001,
            httpPort: 7000,
        };
    });
    it("can be constructed", () => {
        const wsApi = new WsApi_1.WsApi(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
        chai_1.expect(wsApi).not.to.be.undefined;
    });
    it("can get status via websocket", done => {
        const wsApi = new WsApi_1.WsApi(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
        wsApi.connect(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const status = yield wsApi.getStatus();
                chai_1.expect(status.success).to.be.true;
                chai_1.expect(status.os).to.match(/^linux4/);
                chai_1.expect(status.httpPort).to.eql(nodeHttpPort);
                chai_1.expect(status.height).to.be.within(1, 10000000);
                chai_1.expect(status.broadhash).to.match(/^[0-9a-f]{64}$/);
                chai_1.expect(status.version).to.match(/^1\.2\.[0-9]+-rc.[0-9]+$/);
                chai_1.expect(status.nonce).to.match(/^[0-9a-zA-Z]{16,30}$/);
                done();
            }
            catch (error) {
                done(error);
            }
            finally {
                wsApi.destroy();
            }
        }), () => { }, error => {
            throw new Error(error);
        });
    });
    it("can get peers via websocket", done => {
        const wsApi = new WsApi_1.WsApi(nodeHostname, nodeWsPort, nodeHttpPort, ownNode);
        wsApi.connect(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield wsApi.getPeers();
                chai_1.expect(response.success).to.be.true;
                chai_1.expect(response.peers.length).to.be.within(3, 100);
                for (const peer of response.peers) {
                    chai_1.expect(peer.nonce).to.match(/^[0-9a-zA-Z]{16,30}$/);
                    chai_1.expect(peer.ip).to.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/);
                    chai_1.expect(peer.wsPort).to.be.within(0, 65535);
                }
                done();
            }
            catch (error) {
                done(error);
            }
            finally {
                wsApi.destroy();
            }
        }), () => { }, error => {
            throw new Error(error);
        });
    });
});
//# sourceMappingURL=WsApi.spec.js.map