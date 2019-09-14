/**
 * A light implementation for a WAMP client over SocketCluster
 */
export declare class WampClient {
    /***
     * Upgrades the socket to a WAMP capable socket
     * @param socket
     */
    static registerWamp(socket: any): void;
}
