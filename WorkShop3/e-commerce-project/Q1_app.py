from flask import Flask

# Initialiser l'application Flask
app = Flask(__name__)

# Définir une route GET pour afficher "Hello World"
@app.route('/')
def hello_world():
    return 'Hello, World!'

# Lancer le serveur Flask
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
