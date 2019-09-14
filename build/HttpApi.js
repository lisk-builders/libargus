"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
// Lisk HTTP API
// https://app.swaggerhub.com/apis/LiskHQ/Lisk
class HttpApi {
    constructor(hostname, port, secure = false) {
        this.hostname = hostname;
        this.port = port;
        this.secure = secure;
    }
    // node
    getNodeStatus() {
        return this.get(`${this.baseUrl()}/node/status`);
    }
    getForgingStatus() {
        return this.get(`${this.baseUrl()}/node/status/forging`);
    }
    updateForging(forging, pubkey, password) {
        const payload = {
            forging: forging,
            password: password,
            publicKey: pubkey,
        };
        return request.put(`${this.baseUrl()}/node/status/forging`, { json: payload }).promise();
    }
    getBlocks() {
        return this.get(`${this.baseUrl()}/blocks?limit=100`);
    }
    getForgers() {
        return this.get(`${this.baseUrl()}/delegates/forgers?limit=100`);
    }
    getDelegates() {
        return this.get(`${this.baseUrl()}/delegates?limit=101&sort=rank:asc`);
    }
    getLastBlockByDelegate(generatorKey) {
        return this.get(`${this.baseUrl()}/blocks?limit=1&generatorPublicKey=${generatorKey}`).then(data => data.data[0]);
    }
    getBlockByHeight(height) {
        return this.get(`${this.baseUrl()}/blocks?limit=1&height=${height}`).then(data => data.data[0]);
    }
    get(url) {
        const options = { json: true };
        return request(url, options).promise();
    }
    // method is proteced to allow adding endpoints by subclassing
    baseUrl() {
        const protocol = this.secure ? "https" : "http";
        return `${protocol}://${this.hostname}:${this.port}/api`;
    }
}
exports.HttpApi = HttpApi;
//# sourceMappingURL=HttpApi.js.map