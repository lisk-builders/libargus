import * as events from "events";
import * as _ from "underscore";

import { HttpApi } from "./HttpApi";
import { NodeStatus, PeerInfo, WsApi } from "./WsApi";

export enum PeerEvent {
  StatusUpdated = "STATUS_UPDATED",
  PeersUpdated = "PEERS_UPDATED",
  NodeStuck = "NODE_STUCK",
}

export enum PeerState {
  Online,
  Offline,
}

export interface PeerOptions {
  readonly ip: string;
  readonly wsPort: number;
  readonly httpPort: number;
  readonly nethash: string;
  readonly nonce?: string;
}

export interface OwnNodeOptions {
  readonly httpPort: number;
  readonly wsPort: number;
  readonly nonce: string;
  readonly os: string;
  readonly version: string;
  readonly protocolVersion: string;
}

/***
 * A wrapper for LiskClient that automatically updates the node status and keeps track of the connection
 * and checks whether the node is sane (not stuck)
 */
export class Peer extends events.EventEmitter {
  public readonly ws: WsApi;
  public readonly http: HttpApi;
  public readonly options: PeerOptions;
  // tslint:disable-next-line:readonly-array
  public readonly peers: PeerInfo[] = [];

  // tslint:disable-next-line:readonly-keyword
  private lastHeightUpdate: number = 0;
  // tslint:disable-next-line:readonly-keyword
  private stuck: boolean = false;
  private readonly statusUpdateInterval: NodeJS.Timeout;
  // tslint:disable-next-line:readonly-keyword variable-name
  private _state: PeerState = PeerState.Offline;
  // tslint:disable-next-line:readonly-keyword variable-name
  private _status: NodeStatus | undefined;
  // tslint:disable-next-line:readonly-keyword variable-name
  private _httpActive: boolean = false;
  // tslint:disable-next-line:readonly-keyword variable-name
  private _wsServerConnected: boolean = false;

  constructor(options: PeerOptions, ownNode: OwnNodeOptions) {
    super();

    this.options = options;
    this.ws = new WsApi(options.ip, options.wsPort, options.httpPort, {
      ...ownNode,
      nethash: options.nethash,
      height: 500,
    });
    this.http = new HttpApi(options.ip, options.httpPort);

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

  /**
   * The best nonce value available
   */
  get nonce(): string | undefined {
    if (this._status) {
      return this._status.nonce;
    }

    if (this.options.nonce) {
      return this.options.nonce;
    }

    return undefined;
  }

  get state(): PeerState {
    return this._state;
  }

  get status(): NodeStatus | undefined {
    return this._status;
  }

  get httpActive(): boolean {
    return this._httpActive;
  }

  get wsServerConnected(): boolean {
    return this._wsServerConnected;
  }

  /***
   * Handles new NodeStatus received from the Peer
   * Updates sync status and triggers events in case the node is stuck
   * @param {NodeStatus} status
   */
  public handleStatusUpdate(status: NodeStatus): void {
    if (!this._status || status.height > this._status.height) {
      this.lastHeightUpdate = Date.now();
      this.stuck = false;
    } else if (!this.stuck && Date.now() - this.lastHeightUpdate > 20000) {
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
    this._state = PeerState.Online;
  }

  private onClientDisconnect(): void {
    // console.debug(`disconnected from ${this._options.ip}:${this._options.wsPort}`);
    this._state = PeerState.Offline;
  }

  private onClientError(error: any): void {
    console.error(`connection error from ${this.options.ip}:${this.options.wsPort}: ${error}`);
  }

  /***
   * Trigger a status update
   * Updates the node status, connected peers
   */
  private updateStatus(): void {
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
      .catch(err =>
        console.warn(
          `could not update status of ${this.options.ip}:${this.options.wsPort}: ${err}`,
        ),
      );
  }
}
