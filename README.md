# SingleCrypt Text

> [!WARNING]  
> This package uses [`Uint8Array.prototype.toBase64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64) and [`Uint8Array.fromBase64()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64), which, as of November 2025, are only supported by the latest versions of browsers, [Bun](https://bun.com/), [Deno 2.5 or later](https://deno.com/) and [Node.js 25 or later](https://nodejs.org/en). See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64#browser_compatibility) for compatibility.

A simple, secure, and fast symmetric encryption library that makes use of [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) and modern platform features. It leverages the native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), so it works both in browsers (in secure contexts) and JavaScript runtimes.

## Why AES-GCM?

AES-GCM is extremely fast on modern CPUs, which have dedicated hardware acceleration ([AES-NI](https://en.wikipedia.org/wiki/AES_instruction_set)), in addition to being highly secure and even quantum-resistant (AES-256-GCM).

## Installation

Use your preferred package manager.

```shell
# npm
npm i singlecrypt-text

# Yarn
yarn add singlecrypt-text

# pnpm
pnpm add singlecrypt-text

# Bun
bun add singlecrypt-text
```

## Examples

This is a simple demonstration; production uses should utilize **key rotation**, among many other security measures.

There are two ways to use this library: [object-oriented](#object-oriented) (recommended) or [functional-oriented](#functional-oriented).

### Object-oriented

`./lib/crypto/message.ts`

```typescript
import SingleCryptText from "singlecrypt-text";

import { getMessageEncryptionKey } from "./lib/crypto/key";


export const cryptoMessage = new SingleCryptText(
  await getMessageEncryptionKey()
);

// Recommended: Freeze the instance to prevent modification of the `urlSafe` property.
Object.freeze(cryptoMessage);
```

#### Usage

And now you can easily encrypt and decrypt messages:

```typescript
// ...
import { cryptoMessage } from "./lib/crypto/message.ts";
// ...

const message = await getMessage();

const encryptedMessage = await cryptoMessage.encrypt(message);
// ...
const decryptedMessage = await cryptoMessage.decrypt(encryptedMessage);
// ...
console.log(message === decryptedMessage);  // True
// ...
```

### Functional-oriented

`./lib/crypto/message.ts`

```typescript
import {
  createSymmetricKeyFromText,
  encryptTextSymmetrically,
  decryptTextSymmetrically
} from "singlecrypt-text";

import { getMessageEncryptionKey } from "./lib/crypto/key";


const messageCryptoKey = await createSymmetricKeyFromText(
  await getMessageEncryptionKey()
);


export async function encryptMessage(value: string) {
  return await encryptTextSymmetrically(
    value,
    messageCryptoKey
  );
}

export async function decryptMessage(value: string) {
  return await decryptTextSymmetrically(
    value,
    messageCryptoKey
  );
}
```

Or you can reuse `TextEncoder` and `TextDecoder` instances for slightly better performance:

```typescript
import {
  createSymmetricKeyFromText,
  encryptTextSymmetrically,
  decryptTextSymmetrically
} from "singlecrypt-text";

import { getMessageEncryptionKey } from "./lib/crypto/key";


const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const messageCryptoKey = await createSymmetricKeyFromText(
  await getMessageEncryptionKey()
);


export async function encryptMessage(value: string) {
  return await encryptTextSymmetrically(
    value,
    messageCryptoKey,
    textEncoder
  );
}

export async function decryptMessage(value: string) {
  return await decryptTextSymmetrically(
    value,
    messageCryptoKey,
    textDecoder
  );
}
```

#### Usage

And now you can easily encrypt and decrypt messages:

```typescript
// ...
import { encryptMessage, decryptMessage } from "./lib/crypto/message.ts";
// ...

const message = await getMessage();

const encryptedMessage = await encryptMessage(message);
// ...
const decryptedMessage = await decryptMessage(encryptedMessage);
// ...
console.log(message === decryptedMessage);  // True
// ...
```

## Reference

### Object-oriented API: `SingleCryptText`

A class that simplifies symmetric encryption and decryption using a shared key derived from a text string.

It is also the default export.

```ts
new SingleCryptText(
  text: string,
  urlSafe: boolean = true,
  extractable: boolean = false,
  textEncoder?: TextEncoder,
  textDecoder?: TextDecoder
)
```

- `text`: The secret string to use as a key (should be high-entropy, such as a 32-byte random string).
- `urlSafe` (optional): Use `base64url` encoding (`true`, default) or regular `base64` (`false`).
- `extractable` (optional): Whether the generated cryptographic key is extractable. Defaults to `false`.
- `textEncoder`/`textDecoder` (optional): Optionally reuse your own encoder/decoder instances.

#### Instance methods

- `async encrypt(text: string): Promise<string>`
  
  Encrypt a string using the instance's key.

- `async decrypt(encryptedText: string): Promise<string>`
  
  Decrypt a string previously encrypted by this or any compatible instance.

- `async getKey(): Promise<CryptoKey>`
  
  Returns the underlying `CryptoKey` instance.

#### Instance properties

- `urlSafe: boolean`  
  Indicates if the instance uses `base64url` encoding (`true`, default) or standard `base64` (`false`) for encrypted outputs.
  
> [!NOTE]  
> It is recommended to freeze `SingleCryptText` instances with `Object.freeze()` to prevent their modification.

#### Example

```ts
import SingleCryptText from "singlecrypt-text";

const crypt = new SingleCryptText("my secret passphrase");

const encrypted = await crypt.encrypt("Sensitive message!");
const decrypted = await crypt.decrypt(encrypted);

console.log(decrypted); // "Sensitive message!"
```

---


### Functional-oriented API

Functional exports for direct cryptographic operations.

```ts
createSymmetricKeyFromText(
  text: string,
  extractable?: boolean,
  textEncoder?: TextEncoder
): Promise<CryptoKey>
```
- `text`: The secret string to use as a key (should be high-entropy, such as a 32-byte random string).
- `extractable` (optional): Whether the generated key is extractable. Defaults to `false`.
- `textEncoder` (optional): Optionally reuse your own `TextEncoder` instance.

Returns a `Promise<CryptoKey>` containing the derived symmetric key (SHA-256 hash).

**Throws:**  
- `TypeError` if there are problems with the text key.

---

```ts
encryptTextSymmetrically(
  key: CryptoKey,
  text: string,
  urlSafe?: boolean,
  textEncoder?: TextEncoder
): Promise<string>
```
- `key`: A symmetric key previously generated with `createSymmetricKeyFromText`.
- `text`: String value to encrypt.
- `urlSafe` (optional): Use `base64url` encoding if `true` (default: `true`). If `false`, uses regular `base64`.
- `textEncoder` (optional): Optionally reuse your own `TextEncoder` instance.

Returns a `Promise<string>` containing the encrypted value as a Base64 string.

**Throws:**  
- `DOMException` if the key is invalid or if the operation failed (e.g., large payload).

---

```ts
decryptTextSymmetrically(
  key: CryptoKey,
  encryptedText: string,
  urlSafe?: boolean,
  textDecoder?: TextDecoder
): Promise<string>
```
- `key`: A symmetric key previously generated with `createSymmetricKeyFromText`.
- `encryptedText`: The string value to decrypt (encrypted with compatible methods/settings).
- `urlSafe` (optional): If `true` (default), expects `base64url`; if `false`, expects regular `base64`.
- `textDecoder` (optional): Optionally reuse your own `TextDecoder` instance.

Returns a `Promise<string>` containing the decrypted value.

**Throws:**  
- `TypeError`: if the second parameter is not a string.
- `SyntaxError`: if the input contains characters outside the Base64 alphabet.
- `DOMException`: if the key is invalid or if the operation failed.

---

Created by [SSbit01](https://ssbit01.github.io/).
