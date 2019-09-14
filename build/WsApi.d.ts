/***
 * A client for the Lisk p2p Websocket protocol.
 */
export declare class WsApi {
    readonly options: {
        hostname: string;
        port: number;
        httpPort: number;
        query: {};
        connectTimeout: number;
        ackTimeout: number;
        pingTimeout: number;
        autoConnect: boolean;
        autoReconnect: boolean;
        autoReconnectOptions: {
            multiplier: number;
            initialDelay: number;
        };
    };
    private socket;
    constructor(ip: string, wsPort: number, httpPort: number, query: object);
    connect(connectHandler: () => void, closeHandler: () => void, errorHandler: (error: any) => void): void;
    destroy(): void;
    getStatus(): Promise<NodeStatus>;
    getPeers(): Promise<WsPeerResponse>;
    getBlocks(lasBlockId?: string): Promise<WsBlockResponse>;
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
    readonly blocks: ReadonlyArray<WsBlock>;
}
export interface WsPeerResponse {
    readonly success: boolean;
    readonly peers: ReadonlyArray<PeerInfo>;
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
