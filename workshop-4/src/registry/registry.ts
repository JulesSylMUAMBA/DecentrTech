import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const nodesRegistry: Node[] = []; // Liste des nœuds enregistrés

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // Route /status pour vérifier si le serveur est actif
  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  // Route POST pour enregistrer un nœud
  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey }: RegisterNodeBody = req.body;
  
    if (nodesRegistry.some(node => node.nodeId === nodeId)) {
      res.status(400).json({ error: "Node already registered" });
      return;
    }
  
    nodesRegistry.push({ nodeId, pubKey });
    res.json({ success: true });
  });
  

  // Route GET pour récupérer la liste des nœuds enregistrés
  _registry.get("/getNodeRegistry", (req, res) => {
    res.json({ nodes: nodesRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
