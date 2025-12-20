import { describe, expect, test } from "bun:test"
import SingleCryptText, { createSymmetricKeyFromText, encryptTextSymmetrically, decryptTextSymmetrically } from "."


function randomString(length = 32) {
  // A Base64 character is 6 bits: 6 bits / 8 bits = 0.75
  return crypto.getRandomValues(new Uint8Array(length * .75)).toBase64()
}


describe("Functional", () => {

  test("Generate a random symmetric CryptoKey", async() => {
    const key = await createSymmetricKeyFromText(randomString())
    expect(key).toBeDefined()
  })
  
  test("Encrypt a random value", async() => {24 
    const key = await createSymmetricKeyFromText(randomString())
    expect(await encryptTextSymmetrically(key, randomString())).toBeString()
  })
  
  test("Decrypt a random value", async() => {
    const symCryptoKey = await createSymmetricKeyFromText(randomString())
    const randomValue = randomString()
    const ciphertext = await encryptTextSymmetrically(symCryptoKey, randomValue)
    const decrypted = await decryptTextSymmetrically(symCryptoKey, ciphertext)
    expect(randomValue).toBe(decrypted)
  })
  
  
  test("Decrypt a random value with two different CryptoKey objects", async() => {
    const randomKeyString = randomString()
    const symCryptoKey = await createSymmetricKeyFromText(randomKeyString)
    const symCryptoKey2 = await createSymmetricKeyFromText(randomKeyString)
    const randomValue = randomString()
    const ciphertext = await encryptTextSymmetrically(symCryptoKey, randomValue)
    const decrypted = await decryptTextSymmetrically(symCryptoKey2, ciphertext)
    expect(randomValue).toBe(decrypted)
  })
  
  test("Check if encrypting and decrypting with different CryptoKey objects returns an error", async() => {
    const symCryptoKey = await createSymmetricKeyFromText(randomString())
    const symCryptoKey2 = await createSymmetricKeyFromText(randomString())
    const randomValue = randomString()
    const ciphertext = await encryptTextSymmetrically(symCryptoKey, randomValue)
    await expect(decryptTextSymmetrically(symCryptoKey2, ciphertext)).rejects.toThrow()
  })

  test("Check if disabling `urlSafe` changes the encryption results", async() => {
    const symCryptoKey = await createSymmetricKeyFromText(randomString())
    const randomValue = randomString()
    const ciphertextUrlSafe = await encryptTextSymmetrically(symCryptoKey, randomValue, true)
    const ciphertextUrlUnsafe = await encryptTextSymmetrically(symCryptoKey, randomValue, false)
    expect(ciphertextUrlSafe).not.toBe(ciphertextUrlUnsafe)
    const decryptedUrlSafe = await decryptTextSymmetrically(symCryptoKey, ciphertextUrlSafe)
    const decryptedUrlUnafe = await decryptTextSymmetrically(symCryptoKey, ciphertextUrlUnsafe)
    expect(randomValue).toBe(decryptedUrlSafe)
    expect(randomValue).toBe(decryptedUrlUnafe)
  })

})


describe("Object-oriented", () => {

  const singleCryptText1 = new SingleCryptText(randomString())

  test("Encrypt and decrypt random values", async() => {
    const randomValue = randomString()
    const ciphertext = await singleCryptText1.encrypt(randomValue)
    const decrypted = await singleCryptText1.decrypt(ciphertext)
    expect(randomValue).toBe(decrypted)
    let randomValue2
    do {
      randomValue2 = randomString()
    } while (randomValue === randomValue2)
    const ciphertext2 = await singleCryptText1.encrypt(randomValue2)
    expect(ciphertext).not.toBe(ciphertext2)
    const decrypted2 = await singleCryptText1.decrypt(ciphertext2)
    expect(decrypted).not.toBe(decrypted2)
    expect(randomValue2).toBe(decrypted2)
  })

  test("Check if disabling `urlSafe` changes the encryption results", async() => {
    const randomValue = randomString()
    const ciphertext = await singleCryptText1.encrypt(randomValue)
    const decrypted = await singleCryptText1.decrypt(ciphertext)
    expect(randomValue).toBe(decrypted)
    const ciphertext2 = await singleCryptText1.encrypt(randomValue, false)
    expect(ciphertext).not.toBe(ciphertext2)
    const decrypted2 = await singleCryptText1.decrypt(ciphertext2)
    expect(randomValue).toBe(decrypted2)
  })

})