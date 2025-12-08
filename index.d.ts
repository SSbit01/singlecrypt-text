/**
 * Before encrypting and decrypting values, a symmetric `CryptoKey` must be created.
 * This method also converts your value key to a SHA-256 hash.
 *
 * @async
 * @function createSymmetricKeyFromText
 * @param   {string}             text          - Text key to be hashed. A 32-byte high entropy string is recommended.
 * @param   {boolean}            [extractable] - Whether the generated key is extractable. Defaults to `false`..
 * @param   {TextEncoder}        [textEncoder] - If you have an instance of a `TextEncoder`, you can reuse it.
 * @returns {Promise<CryptoKey>} A `CryptoKey` containing a SHA-256 hash used to encrypt and decrypt strings.
 * @throws  {TypeError}          Thrown if `text` is invalid.
 */
export function createSymmetricKeyFromText(text: string, extractable?: boolean, textEncoder?: TextEncoder): Promise<CryptoKey>;
/**
 * Encrypts a value with a `CryptoKey` previously generated with `createSymmetricKeyFromText`.
 *
 * @async
 * @function encryptTextSymmetrically
 * @param   {CryptoKey}       key           - Symmetric key generated with `createSymmetricKeyFromText`.
 * @param   {string}          text          - String value to be encrypted.
 * @param   {boolean}         [urlSafe]     - The encrypted values default to `base64` alphabet; this property enables the `base64url` alphabet. Enabled by default.
 * @param   {TextEncoder}     [textEncoder] - If you have an instance of a `TextEncoder`, you can reuse it.
 * @returns {Promise<string>} The value encrypted and encoded as a Base64 string.
 * @throws  {DOMException}    Raised when:
 * - The provided key is not valid.
 * - The operation failed (e.g., AES-GCM plaintext longer than 2^39−256 bytes).
 */
export function encryptTextSymmetrically(key: CryptoKey, text: string, urlSafe?: boolean, textEncoder?: TextEncoder): Promise<string>;
/**
 * Decrypts a value with a `CryptoKey` previously generated with `createSymmetricKeyFromText`.
 *
 * @async
 * @function decryptTextSymmetrically
 * @param   {CryptoKey}       key           - Symmetric key used to encrypt the value.
 * @param   {string}          encryptedText - Encrypted value to be decrypted.
 * @param   {TextDecoder}     [textDecoder] - If you have an instance of a `TextDecoder`, you can reuse it.
 * @returns {Promise<string>} The value decrypted.
 * @throws  {TypeError}       Thrown if `encryptedText` is not a string.
 * @throws  {SyntaxError}     Thrown if `encryptedText` contains characters outside Base64 alphabet.
 * @throws  {DOMException}    Raised when:
 * - The provided key is not valid.
 * - The operation failed.
 */
export function decryptTextSymmetrically(key: CryptoKey, encryptedText: string, textDecoder?: TextDecoder): Promise<string>;
/**
 * Class that simplifies the encryption and decryption using the same key.
 */
export class SingleCryptText {
    /**
     * Create an instance using a text as a key.
     *
     * @param   {string}      text          - Text key to be hashed. A 32-byte high entropy string is recommended.
     * @param   {boolean}     [extractable] - Whether the generated key is extractable. Defaults to `false`..
     * @param   {TextEncoder} [textEncoder] - If you have an instance of a `TextEncoder`, you can reuse it.
     * @param   {TextDecoder} [textDecoder] - If you have an instance of a `TextDecoder`, you can reuse it.
     * @throws  {TypeError}   Thrown if `text` is invalid.
     */
    constructor(text: string, extractable?: boolean, textEncoder?: TextEncoder, textDecoder?: TextDecoder);
    /**
     * @async
     * @function getKey
     * @returns {Promise<CryptoKey>}
     */
    getKey(): Promise<CryptoKey>;
    /**
     * Encrypts a value.
     *
     * @async
     * @param   {string}          text          - String value to be encrypted.
     * @param   {boolean}         [urlSafe]     - The encrypted values default to `base64` alphabet; this property enables the `base64url` alphabet. Enabled by default.
     * @returns {Promise<string>} The value encrypted and encoded as a Base64 string.
     * @throws  {DOMException}    Raised when:
     * - The provided key is not valid.
     * - The operation failed (e.g., AES-GCM plaintext longer than 2^39−256 bytes).
     */
    encrypt(text: string, urlSafe?: boolean): Promise<string>;
    /**
     * @async
     * @param   {string}          encryptedText - Encrypted value to be decrypted.
     * @returns {Promise<string>} The value decrypted.
     * @throws  {TypeError}       Thrown if `encryptedText` is not a string.
     * @throws  {SyntaxError}     Thrown if `encryptedText` contains characters outside Base64 alphabet.
     * @throws  {DOMException}    Raised when:
     * - The provided key is not valid.
     * - The operation failed.
     */
    decrypt(encryptedText: string): Promise<string>;
    #private;
}
export default SingleCryptText;
