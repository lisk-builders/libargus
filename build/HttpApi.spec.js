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
const HttpApi_1 = require("./HttpApi");
const nodeHostname = process.env.LISK_NODE_HOSTNAME || "testnet.lisk.io";
const nodePort = Number.parseInt(process.env.LISK_NODE_PORT || "7000", 10);
const nodeSecure = !!process.env.LISK_NODE_SECURE;
describe("HttpApi", () => {
    let api;
    beforeEach(() => {
        api = new HttpApi_1.HttpApi(nodeHostname, nodePort, nodeSecure);
    });
    it("can get node status", () => __awaiter(void 0, void 0, void 0, function* () {
        const status = yield api.getNodeStatus();
        chai_1.expect(status.data.broadhash).to.match(/^[0-9a-f]{64}$/);
        chai_1.expect(status.data.consensus).to.be.gt(0);
        chai_1.expect(status.data.consensus).to.be.lte(100);
        chai_1.expect(status.data.height).to.be.gt(1);
        chai_1.expect(status.data.height).to.be.lt(10000000);
        chai_1.expect(status.data.networkHeight).to.be.gt(1);
        chai_1.expect(status.data.networkHeight).to.be.lt(10000000);
        chai_1.expect(status.data.loaded).to.be.true;
        chai_1.expect(status.data.syncing).to.be.false;
        chai_1.expect(status.data.transactions).to.be.not.undefined;
    }));
    it("can get forging status", done => {
        // not whitelisted :(
        api
            .getForgingStatus()
            .then(() => done("must not resolve"))
            .catch(error => {
            chai_1.expect(error).to.match(/403 - {"message":"Access Denied"}/i);
            done();
        });
    });
    it("can get blocks", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.getBlocks();
        chai_1.expect(response.data.length).to.equal(100);
        for (const block of response.data) {
            chai_1.expect(block.id).to.match(/^[0-9]+$/);
            chai_1.expect(block.height).to.be.within(1, 10000000);
            chai_1.expect(block.generatorPublicKey).to.match(/^[0-9a-f]{64}$/);
        }
    }));
    it("can get forgers", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.getForgers();
        chai_1.expect(response.data.length).to.equal(100);
        for (const forger of response.data) {
            chai_1.expect(forger.username).to.match(/^[a-zA-Z0-9_\.]+$/);
            chai_1.expect(forger.publicKey).to.match(/^[0-9a-f]{64}$/);
        }
    }));
    it("can get delegates", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.getDelegates();
        chai_1.expect(response.data.length).to.equal(101);
        for (const delegate of response.data) {
            chai_1.expect(delegate.rank).to.be.within(1, 101);
            chai_1.expect(delegate.username).to.match(/^[a-zA-Z0-9_\.]+$/);
            chai_1.expect(delegate.producedBlocks).to.gte(0);
            chai_1.expect(delegate.missedBlocks).to.gte(0);
            chai_1.expect(delegate.productivity).to.be.within(0, 100);
        }
    }));
    it("can get last block by delegate", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield api.getDelegates();
        const firstDelegate = response.data[0];
        const lastBlock = yield api.getLastBlockByDelegate(firstDelegate.account.publicKey);
        chai_1.expect(lastBlock.id).to.match(/^[0-9]+$/);
        chai_1.expect(lastBlock.height).to.be.within(1, 10000000);
        chai_1.expect(lastBlock.generatorPublicKey).to.eql(firstDelegate.account.publicKey);
    }));
    it("can get block by height", () => __awaiter(void 0, void 0, void 0, function* () {
        const block = yield api.getBlockByHeight(1);
        chai_1.expect(block.id).to.match(/^[0-9]+$/);
        chai_1.expect(block.height).to.be.within(1, 10000000);
        chai_1.expect(block.generatorPublicKey).to.match(/^[0-9a-f]{64}$/);
    }));
});
//# sourceMappingURL=HttpApi.spec.js.map