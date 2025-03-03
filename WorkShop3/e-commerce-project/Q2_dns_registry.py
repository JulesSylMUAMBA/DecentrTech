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
