const encryptionAlgorithm = "AES-GCM"
const ivBytesLength = 12

/**
 * @type {KeyUsage[]}
 */
const keyUsages = ["encrypt", "decrypt"]

Object.freeze(keyUsages)

/**
 * @type {Parameters<Uint8Array<ArrayBuffer>["toBase64"]>[0]} 
 */
const base64UrlOptions = Object.freeze({
  alphabet: "base64url"
})


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
export async function createSymmetricKeyFromText(
  text,
  extractable = false,
  textEncoder = new TextEncoder()
) {

  return (
    await crypto.subtle.importKey(
      "raw",
      await crypto.subtle.digest("SHA-256", textEncoder.encode(text)),
      encryptionAlgorithm,
      extractable,
      keyUsages
    )
  )

}


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
export async function encryptTextSymmetrically(
  key,
  text,
  urlSafe = true,
  textEncoder = new TextEncoder()
) {

  const iv = crypto.getRandomValues(new Uint8Array(ivBytesLength))

  const base64Options = urlSafe ? base64UrlOptions : undefined

  return (
    iv.toBase64(base64Options) +
    new Uint8Array(
      await crypto.subtle.encrypt(
        { name: encryptionAlgorithm, iv },
        key,
        textEncoder.encode(text)
      )
    ).toBase64(base64Options)
  )

}


/**
 * Decrypts a value with a `CryptoKey` previously generated with `createSymmetricKeyFromText`.
 * 
 * @async
 * @function decryptTextSymmetrically
 * @param   {CryptoKey}       key           - Symmetric key used to encrypt the value.
 * @param   {string}          encryptedText - Encrypted value to be decrypted.
 * @param   {boolean}         [urlSafe]     - The encrypted values default to `base64` alphabet; this property enables the `base64url` alphabet. Enabled by default.
 * @param   {TextDecoder}     [textDecoder] - If you have an instance of a `TextDecoder`, you can reuse it.
 * @returns {Promise<string>} The value decrypted.
 * @throws  {TypeError}       Thrown if `encryptedText` is not a string.
 * @throws  {SyntaxError}     Thrown if `encryptedText` contains characters outside Base64 alphabet.
 * @throws  {DOMException}    Raised when:
 * - The provided key is not valid.
 * - The operation failed.
 */
export async function decryptTextSymmetrically(
  key,
  encryptedText,
  urlSafe = true,
  textDecoder = new TextDecoder()
) {

  const data = Uint8Array.fromBase64(encryptedText, urlSafe ? base64UrlOptions : undefined)
  
  return (
    textDecoder.decode(
      await crypto.subtle.decrypt(
        { name: encryptionAlgorithm, iv: data.subarray(0, ivBytesLength) },
        key,
        data.subarray(ivBytesLength)
      )
    )
  )

}


/**
 * Class that simplifies the encryption and decryption using the same key.
 */
export class SingleCryptText {

  /**
   * @type {(CryptoKey|undefined)}
   */
  #key

  /**
   * @type {(Promise<CryptoKey>|undefined)}
   */
  #keyPromise

  #textEncoder

  #textDecoder

  /**
   * The encrypted values default to `base64` alphabet; this property enables the `base64url` alphabet.
   * Enabled by default.
   * 
   * @type {boolean}
   */
  urlSafe

  /**
   * Create an instance using a text as a key.
   * 
   * @param   {string}      text          - Text key to be hashed. A 32-byte high entropy string is recommended.
   * @param   {boolean}     [urlSafe]     - The encrypted values default to `base64` alphabet; this property enables the `base64url` alphabet. Enabled by default.
   * @param   {boolean}     [extractable] - Whether the generated key is extractable. Defaults to `false`..
   * @param   {TextEncoder} [textEncoder] - If you have an instance of a `TextEncoder`, you can reuse it.
   * @param   {TextDecoder} [textDecoder] - If you have an instance of a `TextDecoder`, you can reuse it.
   * @throws  {TypeError}   Thrown if `text` is invalid.
   */
  constructor(
    text,
    urlSafe = true,
    extractable = false,
    textEncoder = new TextEncoder(),
    textDecoder = new TextDecoder()
  ) {
    this.#keyPromise = createSymmetricKeyFromText(text, extractable, textEncoder)
    this.#textEncoder = textEncoder
    this.#textDecoder = textDecoder
    this.urlSafe = urlSafe
  }

  /**
   * @async
   * @function getKey
   * @returns {Promise<CryptoKey>}
   */
  async getKey() {
    if (!this.#key && this.#keyPromise) {
      this.#key = await this.#keyPromise
      this.#keyPromise = undefined
    }
    // @ts-expect-error: TS doesn't detect that `#key` has been defined.
    return this.#key
  }

  /**
   * Encrypts a value.
   * 
   * @async
   * @param   {string}          text          - String value to be encrypted.
   * @returns {Promise<string>} The value encrypted and encoded as a Base64 string.
   * @throws  {DOMException}    Raised when:
   * - The provided key is not valid.
   * - The operation failed (e.g., AES-GCM plaintext longer than 2^39−256 bytes).
   */
  async encrypt(text) {
    return await encryptTextSymmetrically(await this.getKey(), text, this.urlSafe, this.#textEncoder)
  }

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
  async decrypt(encryptedText) {
    return await decryptTextSymmetrically(await this.getKey(), encryptedText, this.urlSafe, this.#textDecoder)
  }

}


export default SingleCryptText