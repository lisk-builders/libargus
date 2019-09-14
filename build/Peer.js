"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const _ = require("underscore");
const HttpApi_1 = require("./HttpApi");
const WsApi_1 = require("./WsApi");
var PeerEvent;
(function (PeerEvent) {
    PeerEvent["StatusUpdated"] = "STATUS_UPDATED";
    PeerEvent["PeersUpdated"] = "PEERS_UPDATED";
    PeerEvent["NodeStuck"] = "NODE_STUCK";
})(PeerEvent = exports.PeerEvent || (exports.PeerEvent = {}));
var PeerState;
(function (PeerState) {
    PeerState[PeerState["Online"] = 0] = "Online";
    PeerState[PeerState["Offline"] = 1] = "Offline";
})(PeerState = exports.PeerState || (exports.PeerState = {}));
/***
 * A wrapper for LiskClient that automatically updates the node status and keeps track of the connection
 * and checks whether the node is sane (not stuck)
 */
class Peer extends events.EventEmitter {
    constructor(options, ownNode) {
        super();
        // tslint:disable-next-line:readonly-array
        this.peers = [];
        // tslint:disable-next-line:readonly-keyword
        this.lastHeightUpdate = 0;
        // tslint:disable-next-line:readonly-keyword
        this.stuck = false;
        // tslint:disable-next-line:readonly-keyword variable-name
        this._state = PeerState.Offline;
        // tslint:disable-next-line:readonly-keyword variable-name
        this._httpActive = false;
        // tslint:disable-next-line:readonly-keyword variable-name
        this._wsServerConnected = false;
        this.options = options;
        this.ws = new WsApi_1.WsApi(options.ip, options.wsPort, options.httpPort, Object.assign(Object.assign({}, ownNode), { nethash: options.nethash, height: 500 }));
        this.http = new HttpApi_1.HttpApi(options.ip, options.httpPort);
        // Check whether client supports HTTP
        this.http
            .getNodeStatus()
            .then(() => (this._httpActive = true))
            .catch(() => { });
        // Connect via WebSocket
        this.ws.connect(() => this.onClientConnect(), () => this.onClientDisconnect(), error => this.onClientError(error));
        // Schedule status updates
        this.statusUpdateInterval = setInterval(() => this.updateStatus(), 2000);
    }
    /**
     * The best nonce value available
     */
    get nonce() {
        if (this._status) {
            return this._status.nonce;
        }
        if (this.options.nonce) {
            return this.options.nonce;
        }
        return undefined;
    }
    get state() {
        return this._state;
    }
    get status() {
        return this._status;
    }
    get httpActive() {
        return this._httpActive;
    }
    get wsServerConnected() {
        return this._wsServerConnected;
    }
    /***
     * Handles new NodeStatus received from the Peer
     * Updates sync status and triggers events in case the node is stuck
     * @param {NodeStatus} status
     */
    handleStatusUpdate(status) {
        if (!this._status || status.height > this._status.height) {
            this.lastHeightUpdate = Date.now();
            this.stuck = false;
        }
        else if (!this.stuck && Date.now() - this.lastHeightUpdate > 20000) {
            this.stuck = true;
            this.emit(PeerEvent.NodeStuck);
        }
        this._status = status;
        // Emit the status update
        this.emit(PeerEvent.StatusUpdated, status);
    }
    /***
     * Set the connection status of the websocket connection for this peer
     * @param {boolean} connected
     */
    setWebsocketServerConnected(connected) {
        this._wsServerConnected = connected;
    }
    /***
     * Destroy the peer and close/destroy the associated socket
     * This does not close the incoming socket connection
     */
    destroy() {
        clearInterval(this.statusUpdateInterval);
        this.ws.destroy();
    }
    requestBlocks() {
        //if (this.httpActive) {
        //    this.client.getBlocksHTTP().then((blockData) => {
        //
        //    })
        //} else {
        this.ws.getBlocks().then(blockData => {
            const filteredBlocks = _.uniq(blockData.blocks, entry => entry.b_id);
        });
        //}
    }
    onClientConnect() {
        // console.debug(`connected to ${this._options.ip}:${this._options.wsPort}`);
        this._state = PeerState.Online;
    }
    onClientDisconnect() {
        // console.debug(`disconnected from ${this._options.ip}:${this._options.wsPort}`);
        this._state = PeerState.Offline;
    }
    onClientError(error) {
        console.error(`connection error from ${this.options.ip}:${this.options.wsPort}: ${error}`);
    }
    /***
     * Trigger a status update
     * Updates the node status, connected peers
     */
    updateStatus() {
        if (this._state !== PeerState.Online) {
            return;
        }
        this.ws
            .getStatus()
            .then(status => this.handleStatusUpdate(status))
            .then(() => this.ws.getPeers())
            .then(response => {
            this.peers.length = 0;
            this.peers.push(...response.peers);
            this.emit(PeerEvent.PeersUpdated, response.peers);
        })
            .catch(err => console.warn(`could not update status of ${this.options.ip}:${this.options.wsPort}: ${err}`));
    }
}
exports.Peer = Peer;
//# sourceMappingURL=Peer.js.map