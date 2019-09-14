/// <reference types="node" />
import * as events from "events";
import { HttpApi } from "./HttpApi";
import { NodeStatus, PeerInfo, WsApi } from "./WsApi";
export declare enum PeerEvent {
    StatusUpdated = "STATUS_UPDATED",
    PeersUpdated = "PEERS_UPDATED",
    NodeStuck = "NODE_STUCK"
}
export declare enum PeerState {
    Online = 0,
    Offline = 1
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
export declare class Peer extends events.EventEmitter {
    readonly ws: WsApi;
    readonly http: HttpApi;
    readonly options: PeerOptions;
    readonly peers: PeerInfo[];
    private lastHeightUpdate;
    private stuck;
    private readonly statusUpdateInterval;
    private _state;
    private _status;
    private _httpActive;
    private _wsServerConnected;
    constructor(options: PeerOptions, ownNode: OwnNodeOptions);
    /**
     * The best nonce value available
     */
    readonly nonce: string | undefined;
    readonly state: PeerState;
    readonly status: NodeStatus | undefined;
    readonly httpActive: boolean;
    readonly wsServerConnected: boolean;
    /***
     * Handles new NodeStatus received from the Peer
     * Updates sync status and triggers events in case the node is stuck
     * @param {NodeStatus} status
     */
    handleStatusUpdate(status: NodeStatus): void;
    /***
     * Set the connection status of the websocket connection for this peer
     * @param {boolean} connected
     */
    setWebsocketServerConnected(connected: boolean): void;
    /***
     * Destroy the peer and close/destroy the associated socket
     * This does not close the incoming socket connection
     */
    destroy(): void;
    requestBlocks(): void;
    private onClientConnect;
    private onClientDisconnect;
    private onClientError;
    /***
     * Trigger a status update
     * Updates the node status, connected peers
     */
    private updateStatus;
}
