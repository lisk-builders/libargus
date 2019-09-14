"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A light implementation for a WAMP client over SocketCluster
 */
class WampClient {
    /***
     * Upgrades the socket to a WAMP capable socket
     * @param socket
     */
    static registerWamp(socket) {
        socket.call = (procedure, data) => new Promise((resolve, reject) => {
            socket.emit("rpc-request", { type: "/RPCRequest", procedure, data }, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (result) {
                        resolve(result.data);
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    }
}
exports.WampClient = WampClient;
//# sourceMappingURL=WampClient.js.map