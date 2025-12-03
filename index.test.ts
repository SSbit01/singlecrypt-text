import { expect, test } from "bun:test"
import { createSymmetricKeyWithText, encryptTextSymmetrically, decryptTextSymmetrically } from "."


function randomString(length = 32) {
  // A Base64 character is 6 bits: 6 bits / 8 bits = 0.75
  return crypto.getRandomValues(new Uint8Array(length * .75)).toBase64()
}


test("Generate a random symmetric CryptoKey", async() => {
  const key = await createSymmetricKeyWithText(randomString())
  expect(key).toBeDefined()
})


test("Encrypt a random value", async() => {
  const key = await createSymmetricKeyWithText(randomString())
  expect(await encryptTextSymmetrically(randomString(), key)).toBeString()
})


test("Decrypt a random value", async() => {
  const symCryptoKey = await createSymmetricKeyWithText(randomString())
  const randomValue = randomString()
  const encrypted = await encryptTextSymmetrically(randomValue, symCryptoKey)
  const decrypted = await decryptTextSymmetrically(encrypted, symCryptoKey)
  expect(randomValue === decrypted).toBeTrue()
})


test("Decrypt a random value with two different CryptoKey objects", async() => {
  const randomKeyString = randomString()
  const symCryptoKey = await createSymmetricKeyWithText(randomKeyString)
  const symCryptoKey2 = await createSymmetricKeyWithText(randomKeyString)
  const randomValue = randomString()
  const encrypted = await encryptTextSymmetrically(randomValue, symCryptoKey)
  const decrypted = await decryptTextSymmetrically(encrypted, symCryptoKey2)
  expect(randomValue === decrypted).toBeTrue()
})

test("Check if encrypting and decrypting with different CryptoKey objects returns an error", async() => {
  const symCryptoKey = await createSymmetricKeyWithText(randomString())
  const symCryptoKey2 = await createSymmetricKeyWithText(randomString())
  const randomValue = randomString()
  const encrypted = await encryptTextSymmetrically(randomValue, symCryptoKey)
  expect(async() => await decryptTextSymmetrically(encrypted, symCryptoKey2)).toThrowError()
})