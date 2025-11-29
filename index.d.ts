/**
 * Before encrypting and decrypting values, a symmetric `CryptoKey` must be created.
 * This method also converts your value key to a SHA-256 hash.
 *
 * @param   {string}             data          - String key to be hashed. A 32-byte high entropy string is recommended.
 * @param   {TextEncoder}        [textEncoder] - If you have an instance of a `TextEncoder`, you can reuse it.
 * @returns {Promise<CryptoKey>} A `CryptoKey` containing a SHA-256 hash used to encrypt and decrypt strings.
 * @throws  {TypeError}          Thrown if `value` is invalid.
 */
export function createSymmetricKeyWithText(data: string, textEncoder?: TextEncoder): Promise<CryptoKey>;
/**
 * Encrypts a value with a `CryptoKey` previously generated with `createSymmetricKeyWithText`.
 *
 * @param   {string}          value         - String value to be encrypted.
 * @param   {CryptoKey}       key           - Symmetric key generated with `createSymmetricKeyWithText`.
 * @param   {TextEncoder}     [textEncoder] - If you have an instance of a `TextEncoder`, you can reuse it.
 * @param   {boolean}         [urlSafe]     - The encrypted values default to `base64` alphabet; this parameter enables the `base64url` alphabet. By default, it is false.
 * @returns {Promise<string>} The value encrypted and encoded as a Base64 string.
 * @throws  {DOMException}    Raised when:
 * - The provided key is not valid.
 * - The operation failed (e.g., AES-GCM plaintext longer than 2^39−256 bytes).
 */
export function encryptSymmetricallyText(value: string, key: CryptoKey, textEncoder?: TextEncoder, urlSafe?: boolean): Promise<string>;
/**
 * Decrypts a value with a `CryptoKey` previously generated with `createSymmetricKeyWithText`.
 *
 * @param   {string}          value         - Encrypted value to be decrypted.
 * @param   {CryptoKey}       key           - Symmetric key used to encrypt the value.
 * @param   {TextDecoder}     [textDecoder] - If you have an instance of a `TextDecoder`, you can reuse it.
 * @param   {boolean}         [urlSafe]     - The encrypted values default to `base64` alphabet; this parameter enables the `base64url` alphabet. By default, it is false.
 * @returns {Promise<string>} The value decrypted.
 * @throws  {TypeError}       Thrown if `value` is not a string.
 * @throws  {SyntaxError}     Thrown if `value` contains characters outside Base64 alphabet.
 * @throws  {DOMException}    Raised when:
 * - The provided key is not valid.
 * - The operation failed.
 */
export function decryptSymmetricallyText(value: string, key: CryptoKey, textDecoder?: TextDecoder, urlSafe?: boolean): Promise<string>;
