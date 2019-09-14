"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function randomCharacter() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}
function randomString(length) {
    return Array.from({ length: length })
        .map(() => randomCharacter())
        .join("");
}
function makeNonce() {
    return randomString(16);
}
exports.makeNonce = makeNonce;
//# sourceMappingURL=nonce.js.map