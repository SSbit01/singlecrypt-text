import { expect, test } from "bun:test"
import SingleCryptText, { createSymmetricKeyFromText, encryptTextSymmetrically, decryptTextSymmetrically } from "."
import { describe } from "node:test"


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
    const encrypted = await encryptTextSymmetrically(symCryptoKey, randomValue)
    const decrypted = await decryptTextSymmetrically(symCryptoKey, encrypted)
    expect(randomValue).toBe(decrypted)
  })
  
  
  test("Decrypt a random value with two different CryptoKey objects", async() => {
    const randomKeyString = randomString()
    const symCryptoKey = await createSymmetricKeyFromText(randomKeyString)
    const symCryptoKey2 = await createSymmetricKeyFromText(randomKeyString)
    const randomValue = randomString()
    const encrypted = await encryptTextSymmetrically(symCryptoKey, randomValue)
    const decrypted = await decryptTextSymmetrically(symCryptoKey2, encrypted)
    expect(randomValue).toBe(decrypted)
  })
  
  test("Check if encrypting and decrypting with different CryptoKey objects returns an error", async() => {
    const symCryptoKey = await createSymmetricKeyFromText(randomString())
    const symCryptoKey2 = await createSymmetricKeyFromText(randomString())
    const randomValue = randomString()
    const encrypted = await encryptTextSymmetrically(symCryptoKey, randomValue)
    expect(async() => await decryptTextSymmetrically(symCryptoKey2, encrypted)).toThrowError()
  })

  test("Check if disabling `urlSafe` changes the encryption results.", async() => {
    const symCryptoKey = await createSymmetricKeyFromText(randomString())
    const randomValue = randomString()
    const encryptedUrlSafe = await encryptTextSymmetrically(symCryptoKey, randomValue, true)
    const encryptedUrlUnsafe = await encryptTextSymmetrically(symCryptoKey, randomValue, false)
    expect(encryptedUrlSafe).not.toBe(encryptedUrlUnsafe)
    const decryptedUrlSafe = await decryptTextSymmetrically(symCryptoKey, encryptedUrlSafe, true)
    const decryptedUrlUnafe = await decryptTextSymmetrically(symCryptoKey, encryptedUrlUnsafe, false)
    expect(randomValue).toBe(decryptedUrlSafe)
    expect(randomValue).toBe(decryptedUrlUnafe)
    expect(async() => await decryptTextSymmetrically(symCryptoKey, encryptedUrlSafe, false)).toThrowError()
    expect(async() => await decryptTextSymmetrically(symCryptoKey, encryptedUrlUnsafe, true)).toThrowError()
  })

})


describe("Object-oriented", () => {

  const singleCryptText1 = new SingleCryptText(randomString())

  test("Decrypt a random value", async() => {
    const randomValue = randomString()
    const encrypted = await singleCryptText1.encrypt(randomValue)
    const decrypted = await singleCryptText1.decrypt(encrypted)
    expect(randomValue).toBe(decrypted)
  })

})