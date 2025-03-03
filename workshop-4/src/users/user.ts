import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT, REGISTRY_PORT, BASE_ONION_ROUTER_PORT } from "../config";
import { rsaEncrypt, exportPubKey, generateRsaKeyPair } from "../crypto";
import { Node, GetNodeRegistryBody } from "../registry/registry";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;
  let lastCircuit: number[] = [];

  const { publicKey } = await generateRsaKeyPair();
  const userPublicKey = await exportPubKey(publicKey);

  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  _user.get("/getLastSentMessage", (req, res) => {
    res.json({ result: lastSentMessage });
  });

  _user.get("/getLastCircuit", (req, res) => {
    res.json({ result: lastCircuit });
  });

  _user.post("/message", (req, res) => {
    lastReceivedMessage = req.body.message || null;
    res.send("success");
  });

  _user.post("/sendMessage", async (req, res) => {
    const { message, destinationUserId } = req.body;
    lastSentMessage = message;

    const registryResponse = await fetch(`http://localhost:${REGISTRY_PORT}/getNodeRegistry`);
    const registryData = (await registryResponse.json()) as GetNodeRegistryBody;
    const { nodes } = registryData;

    const availableNodes = nodes.filter((n: Node) => n.nodeId >= 0 && n.nodeId <= 9);
    const circuit = availableNodes
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((n: Node) => n.nodeId);
    lastCircuit = circuit;

    let layeredMessage = `${BASE_USER_PORT + destinationUserId}|${message}`;
    for (let i = circuit.length - 1; i >= 0; i--) {
      const node = nodes.find((n: Node) => n.nodeId === circuit[i]);
      if (!node) {
        res.status(500).send("error: node not found in registry");
        return;
      }
      const nextHop = i === circuit.length - 1 ? "user" : `${circuit[i + 1]}`;
      layeredMessage = await rsaEncrypt(`${nextHop}|${layeredMessage}`, node.pubKey);
    }

    const firstNodePort = BASE_ONION_ROUTER_PORT + circuit[0];
    try {
      await fetch(`http://localhost:${firstNodePort}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedMessage: layeredMessage, nextHop: `${circuit[1]}` }),
      });
      res.send("success");
    } catch (error) {
      console.error(`Error sending message from user ${userId}:`, error);
      res.status(500).send("error");
    }
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}