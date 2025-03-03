import { generateRsaKeyPair, exportPrvKey, importPrvKey } from "./crypto";

async function testPrivateKeyImport() {
  const { privateKey } = await generateRsaKeyPair();
  
  const exportedKey = await exportPrvKey(privateKey);
  console.log("TEST: Exported Private Key:", exportedKey);

  const importedKey = await importPrvKey(exportedKey);
  console.log("TEST: Successfully imported private key:", importedKey);
}

testPrivateKeyImport();
