import { webcrypto } from "crypto";

type CryptoKey = webcrypto.CryptoKey;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}


export async function generateRsaKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> {
  return await webcrypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportPubKey(publicKey: CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("spki", publicKey);
  const base64Key = arrayBufferToBase64(exported);
  console.log("DEBUG exportPubKey =>", base64Key); // AJOUT DE LOG
  return base64Key;
}


export async function exportPrvKey(privateKey: CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("pkcs8", privateKey);

  console.error("DEBUG (Jest) exportPrvKey (raw bytes) =>", exported.byteLength, "bytes");

  const base64Key = arrayBufferToBase64(exported);
  console.error("DEBUG (Jest) exportPrvKey (base64) =>", base64Key.slice(0, 50), "...");

  return base64Key;
}




export async function importPubKey(strKey: string): Promise<CryptoKey> {
  console.log("DEBUG importPubKey =>", strKey); // AJOUT DE LOG
  try {
    return await webcrypto.subtle.importKey(
      "spki",
      base64ToArrayBuffer(strKey),
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  } catch (error) {
    console.error("Error importing public key:", error);
    throw error;
  }
}

export async function importPrvKey(strKey: string): Promise<CryptoKey> {
  console.log("DEBUG importPrvKey: Received key (base64) =>", strKey.slice(0, 50), "...");

  const keyBuffer = base64ToArrayBuffer(strKey);
  console.log("DEBUG importPrvKey: Converted to ArrayBuffer, size =>", keyBuffer.byteLength, "bytes");

  try {
    const importedKey = await webcrypto.subtle.importKey(
      "pkcs8",
      keyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );
    console.log("DEBUG importPrvKey: Successfully imported key");
    return importedKey;
  } catch (error) {
    console.error("ERROR importPrvKey:", error);
    throw error;
  }
}





export async function rsaEncrypt(b64Data: string, strPublicKey: string): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);
  const dataBuffer = Buffer.from(b64Data, "utf-8");
  const encrypted = await webcrypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    dataBuffer
  );
  return arrayBufferToBase64(encrypted);
}


export async function rsaDecrypt(cipherText: string, privateKey: CryptoKey): Promise<string> {
  console.log("DEBUG rsaDecrypt: Received cipherText (base64) =>", cipherText.slice(0, 50), "...");
  
  try {
    const encryptedBuffer = base64ToArrayBuffer(cipherText);
    console.log("DEBUG rsaDecrypt: Converted cipherText to ArrayBuffer, size =>", encryptedBuffer.byteLength, "bytes");

    console.log("DEBUG rsaDecrypt: Private Key Algorithm =>", privateKey.algorithm);
    
    const decryptedBuffer = await webcrypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedBuffer
    );

    const decryptedMessage = new TextDecoder().decode(decryptedBuffer);
    console.log("DEBUG rsaDecrypt: Decrypted message =>", decryptedMessage);

    return decryptedMessage;
  } catch (error) {
    console.error("ERROR in rsaDecrypt:", error);
    console.error("DEBUG rsaDecrypt: Failed for cipherText (base64) =>", cipherText);
    throw error;
  }
}


export async function createRandomSymmetricKey(): Promise<CryptoKey> {
  return await webcrypto.subtle.generateKey(
    { name: "AES-CBC", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportSymKey(key: CryptoKey): Promise<string> {
  const exported = await webcrypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

export async function importSymKey(strKey: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(strKey);
  if (keyBuffer.byteLength !== 32) {
    throw new Error(`Invalid key length: expected 32 bytes, got ${keyBuffer.byteLength}`);
  }
  return await webcrypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC" },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function symEncrypt(key: CryptoKey, data: string): Promise<{ iv: string; encryptedData: string }> {
  const iv = webcrypto.getRandomValues(new Uint8Array(16));
  const encrypted = await webcrypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    Buffer.from(data, "utf-8")
  );
  return {
    iv: arrayBufferToBase64(iv),
    encryptedData: arrayBufferToBase64(encrypted),
  };
}

export async function symDecrypt(strKey: string, encryptedPayload: { iv: string; encryptedData: string }): Promise<string> {
  const key = await importSymKey(strKey);
  const decrypted = await webcrypto.subtle.decrypt(
    { name: "AES-CBC", iv: base64ToArrayBuffer(encryptedPayload.iv) },
    key,
    base64ToArrayBuffer(encryptedPayload.encryptedData)
  );
  return Buffer.from(decrypted).toString("utf-8");
}