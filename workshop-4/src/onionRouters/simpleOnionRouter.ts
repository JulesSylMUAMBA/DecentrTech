import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import { generateRsaKeyPair, exportPubKey, exportPrvKey, rsaDecrypt } from "../crypto";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  const { publicKey, privateKey } = await generateRsaKeyPair();
  const publicKeyString = await exportPubKey(publicKey);
  const privateKeyString = await exportPrvKey(privateKey);

  async function registerNode() {
    try {
      const response = await fetch(`http://localhost:${REGISTRY_PORT}/registerNode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, pubKey: publicKeyString }),
      });
      if (!response.ok) {
        console.error(`Failed to register node ${nodeId}`);
      } else {
        console.log(`Node ${nodeId} registered successfully`);
      }
    } catch (error) {
      console.error(`Error registering node ${nodeId}:`, error);
    }
  }

  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({ result: lastMessageDestination });
  });

  onionRouter.get("/getPrivateKey", (req, res) => {
    console.log(`DEBUG /getPrivateKey called on node ${nodeId}`);
    console.log(`DEBUG privateKeyString (base64) =>`, privateKeyString.slice(0, 50), "...");
  
    res.json({ result: privateKeyString });
  });
  

  onionRouter.post("/message", async (req, res) => {
    const { encryptedMessage, nextHop } = req.body;
    lastReceivedEncryptedMessage = encryptedMessage;

    try {
      const decryptedMessage = await rsaDecrypt(encryptedMessage, privateKey);
      lastReceivedDecryptedMessage = decryptedMessage;

      const [nextDestination, payload] = decryptedMessage.split("|");
      lastMessageDestination = parseInt(nextDestination);

      if (nextHop === "user") {
        await fetch(`http://localhost:${lastMessageDestination}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: payload }),
        });
      } else {
        const nextNodePort = BASE_ONION_ROUTER_PORT + parseInt(nextHop);
        await fetch(`http://localhost:${nextNodePort}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encryptedMessage: payload, nextHop: nextDestination }),
        });
      }
      res.send("success");
    } catch (error) {
      console.error(`Error processing message at node ${nodeId}:`, error);
      res.status(500).send("error");
    }
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, async () => {
    console.log(`Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`);
    await registerNode();
  });

  return server;
}