export declare class HttpApi {
    protected readonly hostname: string;
    protected readonly port: number;
    protected readonly secure: boolean;
    constructor(hostname: string, port: number, secure?: boolean);
    getNodeStatus(): Promise<ResponseObject<NodeStatusExtended>>;
    getForgingStatus(): Promise<ResponseList<ForgingStatus>>;
    updateForging(forging: boolean, pubkey: string, password: string): Promise<ResponseList<ForgingStatus>>;
    getBlocks(): Promise<ResponseList<Block>>;
    getForgers(): Promise<ForgerResponse>;
    getDelegates(): Promise<ResponseList<DelegateDetails>>;
    getLastBlockByDelegate(generatorKey: string): Promise<Block>;
    getBlockByHeight(height: number): Promise<Block>;
    protected get(url: string): Promise<any>;
    protected baseUrl(): string;
}
export interface Block {
    readonly id: string;
    readonly version: number;
    readonly timestamp: number;
    readonly height: number;
    readonly numberOfTransactions: number;
    readonly totalAmount: string;
    readonly totalFee: string;
    readonly reward: string;
    readonly payloadLength: number;
    readonly payloadHash: string;
    readonly generatorPublicKey: string;
    readonly blockSignature: string;
    readonly confirmations: number;
    readonly totalForged: string;
    readonly generatorAddress: string;
    readonly previousBlockId: string;
}
export interface TransactionsStats {
    readonly confirmed: number;
    readonly unconfirmed: number;
    readonly unprocessed: number;
    readonly unsigned: number;
    readonly total: number;
}
export interface NodeStatusExtended {
    readonly broadhash: string;
    readonly consensus: number;
    readonly height: number;
    readonly loaded: boolean;
    readonly networkHeight: number;
    readonly syncing: boolean;
    readonly transactions: TransactionsStats;
}
export interface ForgingStatus {
    readonly forging: boolean;
    readonly publicKey: string;
}
export interface ForgerMeta {
    readonly lastBlock: number;
    readonly lastBlockSlot: number;
    readonly currentSlot: number;
    readonly limit: number;
    readonly offset: number;
}
export interface ForgerDetail {
    readonly publicKey: string;
    readonly username: string;
    readonly address: string;
    readonly nextSlot: number;
}
export interface ForgerResponse {
    readonly meta: ForgerMeta;
    readonly data: ReadonlyArray<ForgerDetail>;
}
export interface Account {
    readonly address: string;
    readonly publicKey: string;
    readonly secondPublicKey: string;
}
export interface DelegateDetails {
    readonly rewards: string;
    readonly vote: string;
    readonly producedBlocks: number;
    readonly missedBlocks: number;
    readonly username: string;
    readonly rank: number;
    readonly approval: number;
    readonly productivity: number;
    readonly account: Account;
}
export interface ResponseObject<T> {
    readonly meta: any;
    readonly data: T;
}
export interface ResponseList<T> {
    readonly meta: any;
    readonly data: ReadonlyArray<T>;
}
