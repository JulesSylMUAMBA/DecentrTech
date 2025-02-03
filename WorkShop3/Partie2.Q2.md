# Question 2: Création d’un DNS Registry avec Flask

## 📌 Objectif
L'objectif de cette question est de créer un **registre DNS** en Flask qui fournit l'URL du serveur actif.

## 🚀 Implémentation
J'ai utilisé Flask pour créer une **API DNS Registry** qui retourne l'URL d'un serveur en cours d'exécution.

### 📜 Code (`dns_registry.py`)
```python
from flask import Flask, jsonify

app = Flask(__name__)

# Définir l'URL du serveur actif
ACTIVE_SERVER = "localhost:3001"

# Route pour récupérer le serveur actif
@app.route('/getServer', methods=['GET'])
def get_server():
    return jsonify({"code": 200, "server": ACTIVE_SERVER})

# Lancer le serveur Flask
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
