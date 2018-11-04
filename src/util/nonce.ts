function randomCharacter(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

function randomString(length: number): string {
  return Array.from({ length: length })
    .map(() => randomCharacter())
    .join("");
}

export function makeNonce(): string {
  return randomString(16);
}
