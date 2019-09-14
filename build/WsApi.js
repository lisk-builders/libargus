"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socketCluster = require("socketcluster-client");
const WampClient_1 = require("./websockets/WampClient");
/***
 * A client for the Lisk p2p Websocket protocol.
 */
class WsApi {
    constructor(ip, wsPort, httpPort, query) {
        this.options = {
            hostname: "betanet.lisk.io",
            port: 5001,
            httpPort: 5000,
            query: {},
            connectTimeout: 2000,
            ackTimeout: 2000,
            pingTimeout: 2000,
            autoConnect: true,
            autoReconnect: true,
            autoReconnectOptions: {
                multiplier: 1,
                initialDelay: 5000,
            },
        };
        this.options.hostname = ip;
        this.options.port = wsPort;
        this.options.httpPort = httpPort;
        this.options.query = query;
    }
    connect(connectHandler, closeHandler, errorHandler) {
        // Initiate the connection to the server
        this.socket = socketCluster.create(this.options);
        WampClient_1.WampClient.registerWamp(this.socket);
        this.socket.on("connect", connectHandler);
        this.socket.on("close", closeHandler);
        this.socket.on("error", errorHandler);
    }
    destroy() {
        this.socket.destroy();
    }
    getStatus() {
        return this.socket.call("status");
    }
    getPeers() {
        return this.socket.call("list");
    }
    getBlocks(lasBlockId) {
        return this.socket.call("blocks", { lastId: lasBlockId || "" });
    }
}
exports.WsApi = WsApi;
//# sourceMappingURL=WsApi.js.map