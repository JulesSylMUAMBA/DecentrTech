# Question 1: Création d'un serveur Flask "Hello World"

## 📌 Objectif
L'objectif de cette question est de créer un serveur **Flask minimal** qui affiche `"Hello, World!"` lorsqu'on accède à la racine (`/`).

## 🚀 Implémentation
Nous avons utilisé Flask pour implémenter un serveur basique. Voici le code source utilisé :

### 📜 Code (`app.py`)
```python
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
