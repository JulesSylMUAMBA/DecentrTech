import { generateRsaKeyPair, rsaEncrypt, rsaDecrypt, exportPubKey } from "./crypto";

async function testRsaDecrypt() {
    console.log("TEST: Début du test de rsaDecrypt...");

    // 1️⃣ Générer une paire de clés RSA
    const { publicKey, privateKey } = await generateRsaKeyPair();

    console.log("TEST: Clés RSA générées.");

    // Convertir la clé publique en base64 pour l'utiliser avec rsaEncrypt
    const publicKeyString = await exportPubKey(publicKey);
    console.log("TEST: Clé publique (Base64) =>", publicKeyString);

    // 2️⃣ Message à chiffrer
    const message = "Hello, this is a test message!";
    console.log("TEST: Message original =>", message);

    // 3️⃣ Chiffrement du message avec la clé publique en base64
    const encryptedMessage = await rsaEncrypt(message, publicKeyString);
    console.log("TEST: Message chiffré (Base64) =>", encryptedMessage);

    // 4️⃣ Déchiffrement du message
    try {
        const decryptedMessage = await rsaDecrypt(encryptedMessage, privateKey);
        console.log("TEST: Message déchiffré =>", decryptedMessage);
    } catch (error) {
        console.error("TEST: Erreur lors du déchiffrement ❌:", error);
    }
}

testRsaDecrypt();
