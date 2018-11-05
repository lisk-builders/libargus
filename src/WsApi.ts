import * as socketCluster from "socketcluster-client";

import { WampClient } from "./websockets/WampClient";

/***
 * LiskClient is a client for the Lisk Core Websocket and HTTP protocol.
 * It maintains a Websocket connection and can call various HTTP endpoints.
 */
export class WsApi {
  public options = {
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

  private socket: any;

  constructor(ip: string, wsPort: number, httpPort: number, query: object) {
    this.options.hostname = ip;
    this.options.port = wsPort;
    this.options.httpPort = httpPort;
    this.options.query = query;
  }

  public connect(
    connectHandler: () => void,
    closeHandler: () => void,
    errorHandler: (error: any) => void,
  ): void {
    // Initiate the connection to the server
    this.socket = socketCluster.create(this.options);
    WampClient.registerWamp(this.socket);

    this.socket.on("connect", connectHandler);
    this.socket.on("close", closeHandler);
    this.socket.on("error", errorHandler);
  }

  public destroy(): void {
    this.socket.destroy();
  }

  public getStatus(): Promise<NodeStatus> {
    return this.socket.call("status");
  }

  public getPeers(): Promise<WsPeerResponse> {
    return this.socket.call("list");
  }

  public getBlocks(lasBlockId?: string): Promise<WsBlockResponse> {
    return this.socket.call("blocks", { lastId: lasBlockId || "" });
  }
}

export interface NodeStatus {
  readonly success: boolean;
  readonly height: number;
  readonly broadhash: string;
  readonly nonce: string;
  readonly httpPort: number;
  readonly version: string;
  readonly os: string;
}

export interface WsBlock {
  readonly b_id: string;
  readonly b_version: number;
  readonly b_timestamp: number;
  readonly b_height: number;
  readonly b_previousBlock: string;
  readonly b_numberOfTransactions: number;
  readonly b_totalAmount: string;
  readonly b_totalFee: string;
  readonly b_reward: string;
  readonly b_payloadLength: number;
  readonly b_payloadHash: string;
  readonly b_generatorPublicKey: string;
  readonly b_blockSignature: string;
  readonly t_id: string;
  readonly t_rowId?: number;
  readonly t_type?: number;
  readonly t_timestamp?: number;
  readonly t_senderPublicKey: string;
  readonly t_senderId: string;
  readonly t_recipientId: string;
  readonly t_amount: string;
  readonly t_fee: string;
  readonly t_signature: string;
  readonly t_signSignature?: any;
  readonly s_publicKey?: any;
  readonly d_username: string;
  readonly v_votes: string;
  readonly m_min?: any;
  readonly m_lifetime?: any;
  readonly m_keysgroup?: any;
  readonly dapp_name?: any;
  readonly dapp_description?: any;
  readonly dapp_tags?: any;
  readonly dapp_type?: any;
  readonly dapp_link?: any;
  readonly dapp_category?: any;
  readonly dapp_icon?: any;
  readonly in_dappId?: any;
  readonly ot_dappId?: any;
  readonly ot_outTransactionId?: any;
  readonly t_requesterPublicKey?: any;
  readonly tf_data?: any;
  readonly t_signatures?: any;
}

export interface WsBlockResponse {
  readonly blocks: WsBlock[];
}

export interface WsPeerResponse {
  readonly success: boolean;
  readonly peers: PeerInfo[];
}

export interface PeerInfo {
  readonly ip: string;
  readonly httpPort: number;
  readonly wsPort: number;
  readonly nonce: string;
  readonly version: string;
  readonly state?: number;
  readonly os?: string;
  readonly broadhash?: string;
  readonly height?: number;
  readonly updated?: any;
}
