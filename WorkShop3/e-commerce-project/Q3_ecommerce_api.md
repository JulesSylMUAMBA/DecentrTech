# Question 3: Création de l’API E-commerce avec Flask

## 📌 Objectif
L'objectif est de créer une **API REST en Flask** qui gère :
- **Les produits** (ajout, mise à jour, suppression, liste).
- **Les commandes** (création, récupération).
- **Le panier d’achat** (ajout, suppression d’articles).

## 🚀 Implémentation
L'API utilise **Flask** et stocke les produits dans un **fichier JSON (`database.json`)**.

### 📜 Code (`ecommerce_api.py`)
```python
from flask import Flask, jsonify, request
import json
import os

app = Flask(__name__)

# Fichier JSON pour stocker les produits et commandes
DB_FILE = "database.json"

# Vérifier si la base de données existe, sinon la créer
if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w") as f:
        json.dump({"products": [], "orders": [], "cart": {}}, f, indent=4)

# Charger la base de données
def load_database():
    with open(DB_FILE, "r") as f:
        return json.load(f)

# Sauvegarder les modifications
def save_database(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# Route GET pour récupérer tous les produits
@app.route('/products', methods=['GET'])
def get_products():
    db = load_database()
    return jsonify(db["products"])

# Route POST pour ajouter un produit
@app.route('/products', methods=['POST'])
def add_product():
    db = load_database()
    new_product = request.json
    new_product["id"] = len(db["products"]) + 1  # Générer un ID unique
    db["products"].append(new_product)
    save_database(db)
    return jsonify(new_product), 201

# Route DELETE pour supprimer un produit
@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    db = load_database()
    db["products"] = [p for p in db["products"] if p["id"] != product_id]
    save_database(db)
    return jsonify({"message": "Produit supprimé"}), 200

# Lancer le serveur Flask
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)
