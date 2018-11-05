import * as events from "events";
import * as _ from "underscore";

import { HttpApi } from "./HttpApi";
import { NodeStatus, PeerInfo, WsApi } from "./WsApi";

export enum PeerEvent {
  statusUpdated = "STATUS_UPDATED",
  peersUpdated = "PEERS_UPDATED",
  nodeStuck = "NODE_STUCK",
}

export enum PeerState {
  ONLINE,
  OFFLINE,
}

export interface PeerOptions {
  ip: string;
  wsPort: number;
  httpPort: number;
  nonce: string;
  nethash: string;
}

export interface OwnNodeOptions {
  readonly httpPort: number;
  readonly wsPort: number;
  readonly nonce: string;
  readonly os: string;
  readonly version: string;
}

/***
 * A wrapper for LiskClient that automatically updates the node status and keeps track of the connection
 * and checks whether the node is sane (not stuck)
 */
export class Peer extends events.EventEmitter {
  public readonly ws: WsApi;
  public readonly http: HttpApi;
  public peers: PeerInfo[] = [];

  private _lastHeightUpdate: number = 0;
  private _stuck: boolean = false;
  private readonly statusUpdateInterval: NodeJS.Timeout;

  constructor(readonly _options: PeerOptions, ownNode: OwnNodeOptions) {
    super();

    this.ws = new WsApi(_options.ip, _options.wsPort, _options.httpPort, {
      ...ownNode,
      nethash: _options.nethash,
      height: 500,
    });

    this.http = new HttpApi(_options.ip, _options.httpPort);

    // Check whether client supports HTTP
    this.http
      .getNodeStatus()
      .then(() => (this._httpActive = true))
      .catch(() => {});

    // Connect via WebSocket
    this.ws.connect(
      () => this.onClientConnect(),
      () => this.onClientDisconnect(),
      error => this.onClientError(error),
    );

    // Schedule status updates
    this.statusUpdateInterval = setInterval(() => this.updateStatus(), 2000);
  }

  private _state: PeerState = PeerState.OFFLINE;

  get state(): PeerState {
    return this._state;
  }

  private _status: NodeStatus | undefined;

  get status(): NodeStatus | undefined {
    return this._status;
  }

  private _httpActive: boolean = false;

  get httpActive(): boolean {
    return this._httpActive;
  }

  private _wsServerConnected: boolean = false;

  get wsServerConnected(): boolean {
    return this._wsServerConnected;
  }

  get options(): PeerOptions {
    return this._options;
  }

  /***
   * Handles new NodeStatus received from the Peer
   * Updates sync status and triggers events in case the node is stuck
   * @param {NodeStatus} status
   */
  public handleStatusUpdate(status: NodeStatus): void {
    if (!this._status || status.height > this._status.height) {
      this._lastHeightUpdate = Date.now();
      this._stuck = false;
    } else if (!this._stuck && Date.now() - this._lastHeightUpdate > 20000) {
      this._stuck = true;
      this.emit(PeerEvent.nodeStuck);
    }

    // Apply new status
    if (!this._status) {
      this._status = status;
    }
    this._status = Object.assign(this._status, status);
    this._options.nonce = status.nonce;

    // Emit the status update
    this.emit(PeerEvent.statusUpdated, status);
  }

  /***
   * Set the connection status of the websocket connection for this peer
   * @param {boolean} connected
   */
  public setWebsocketServerConnected(connected: boolean): void {
    this._wsServerConnected = connected;
  }

  /***
   * Destroy the peer and close/destroy the associated socket
   * This does not close the incoming socket connection
   */
  public destroy(): void {
    clearInterval(this.statusUpdateInterval);
    this.ws.destroy();
  }

  public requestBlocks(): void {
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

  private onClientConnect(): void {
    // console.debug(`connected to ${this._options.ip}:${this._options.wsPort}`);
    this._state = PeerState.ONLINE;
  }

  private onClientDisconnect(): void {
    // console.debug(`disconnected from ${this._options.ip}:${this._options.wsPort}`);
    this._state = PeerState.OFFLINE;
  }

  private onClientError(error: any): void {
    console.error(`connection error from ${this._options.ip}:${this._options.wsPort}: ${error}`);
  }

  /***
   * Trigger a status update
   * Updates the node status, connected peers
   */
  private updateStatus(): void {
    if (this._state !== PeerState.ONLINE) {
      return;
    }

    this.ws
      .getStatus()
      .then(status => this.handleStatusUpdate(status))
      .then(() => this.ws.getPeers())
      .then(res => {
        this.peers = res.peers;
        this.emit(PeerEvent.peersUpdated, res.peers);
      })
      .catch(err =>
        console.warn(
          `could not update status of ${this._options.ip}:${this._options.wsPort}: ${err}`,
        ),
      );
  }
}
