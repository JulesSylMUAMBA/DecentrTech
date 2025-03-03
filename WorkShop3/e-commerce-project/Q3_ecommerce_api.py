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

# Route GET pour récupérer un produit spécifique
@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    db = load_database()
    product = next((p for p in db["products"] if p["id"] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Produit non trouvé"}), 404

# Route DELETE pour supprimer un produit
@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    db = load_database()
    db["products"] = [p for p in db["products"] if p["id"] != product_id]
    save_database(db)
    return jsonify({"message": "Produit supprimé"}), 200

# Route POST pour créer une commande
@app.route('/orders', methods=['POST'])
def create_order():
    db = load_database()
    order_data = request.json
    user_id = order_data.get("userId")
    cart = db["cart"].get(str(user_id), [])  # Récupérer le panier de l'utilisateur

    if not cart:
        return jsonify({"error": "Le panier est vide"}), 400

    order_id = len(db["orders"]) + 1
    total_price = sum(p["price"] * p["quantity"] for p in cart)

    new_order = {
        "id": order_id,
        "userId": user_id,
        "products": cart,
        "total": total_price,
        "status": "confirmed"
    }

    db["orders"].append(new_order)
    db["cart"][str(user_id)] = []  # Vider le panier après commande
    save_database(db)

    return jsonify(new_order), 201

# Route GET pour récupérer les commandes d'un utilisateur
@app.route('/orders/<user_id>', methods=['GET'])
def get_orders(user_id):
    db = load_database()
    user_orders = [order for order in db["orders"] if str(order["userId"]) == str(user_id)]
    return jsonify(user_orders)

# Route POST pour ajouter un produit au panier
@app.route('/cart/<user_id>', methods=['POST'])
def add_to_cart(user_id):
    db = load_database()
    product_data = request.json
    product_id = product_data.get("productId")
    quantity = product_data.get("quantity", 1)

    # Vérifier si le produit existe
    product = next((p for p in db["products"] if p["id"] == product_id), None)
    if not product:
        return jsonify({"error": "Produit introuvable"}), 404

    # Ajouter au panier
    if str(user_id) not in db["cart"]:
        db["cart"][str(user_id)] = []

    db["cart"][str(user_id)].append({
        "id": product["id"],
        "name": product["name"],
        "price": product["price"],
        "quantity": quantity
    })

    save_database(db)
    return jsonify({"message": "Produit ajouté au panier"}), 200

# Route GET pour voir le panier d'un utilisateur
@app.route('/cart/<user_id>', methods=['GET'])
def get_cart(user_id):
    db = load_database()
    return jsonify(db["cart"].get(str(user_id), []))

# Route DELETE pour supprimer un produit du panier
@app.route('/cart/<user_id>/item/<int:product_id>', methods=['DELETE'])
def remove_from_cart(user_id, product_id):
    db = load_database()
    user_cart = db["cart"].get(str(user_id), [])

    # Filtrer le panier en supprimant le produit ciblé
    updated_cart = [item for item in user_cart if item["id"] != product_id]
    db["cart"][str(user_id)] = updated_cart

    save_database(db)
    return jsonify({"message": "Produit retiré du panier"}), 200

# Lancer le serveur Flask
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)
