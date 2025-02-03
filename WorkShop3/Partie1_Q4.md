# Question 4: Implémentation du Proof-of-Stake avec Slashing

## **1. Objectif**

Pour garantir la fiabilité du réseau de prédiction, j'ai mis en place un **mécanisme de Proof-of-Stake (PoS) avec Slashing**. 
Ce système repose sur trois principes :

1. **Chaque modèle doit faire un dépôt initial** (1000€) pour participer au réseau.
2. **Un slashing est appliqué** : en cas d'erreurs fréquentes, une partie du dépôt est retirée.
3. **Les poids des modèles sont ajustés dynamiquement** en fonction de leur précision.

Ce protocole favorise les modèles fiables et pénalise ceux qui font trop d'erreurs.

---

## **2. Implémentation du Mécanisme de Proof-of-Stake avec Slashing**

### **Stratégie utilisée :**
- **Création d’une base de données JSON** locale pour suivre le solde des modèles.
- **Application d’une pénalité (50€ par erreur) pour les modèles imprécis.**
- **Ajustement des poids** après chaque batch de prédictions.

### **Code utilisé :**
```python
import json
import numpy as np

# Nom du fichier JSON
json_db_file = "model_balances.json"

# Charger la base JSON
def load_model_balances():
    with open(json_db_file, "r") as f:
        return json.load(f)

# Sauvegarder la base JSON
def save_model_balances(data):
    with open(json_db_file, "w") as f:
        json.dump(data, f, indent=4, default=lambda x: float(x) if isinstance(x, np.generic) else x)

# Fonction pour appliquer le slashing et ajuster les poids
def apply_slashing_and_adjust_weights(true_labels, predictions):
    model_balances = load_model_balances()
    penalty = 50  # Montant retiré en cas de mauvaise prédiction

    for model_name, pred in predictions.items():
        correct_predictions = sum(pred == true_labels)
        incorrect_predictions = len(true_labels) - correct_predictions

        # Mise à jour des stats
        model_balances[model_name]["correct"] += correct_predictions
        model_balances[model_name]["incorrect"] += incorrect_predictions

        # Appliquer la pénalité
        model_balances[model_name]["balance"] -= incorrect_predictions * penalty

        # Ajuster le poids dynamiquement
        total_predictions = model_balances[model_name]["correct"] + model_balances[model_name]["incorrect"]
        if total_predictions > 0:
            accuracy = model_balances[model_name]["correct"] / total_predictions
            model_balances[model_name]["weight"] = max(0.1, accuracy)  # Empêcher un poids nul

    save_model_balances(model_balances)
```

---

## **3. Résultats et Analyse**

Après exécution du programme sur un batch de prédictions :

| Modèle                | Balance (€) | Correct | Incorrect | Nouveau Poids |
|----------------------|------------|---------|-----------|---------------|
| Logistic Regression | **750€**   | 5       | 5         | **0.5**       |
| Random Forest       | **700€**   | 4       | 6.4       | **0.38**      |
| SVM                 | **650€**   | 3       | 7         | **0.3**       |

🔹 **Analyse** :
- **Les modèles les plus précis conservent un meilleur solde et un poids plus élevé.**
- **Le slashing pénalise les modèles imprécis**, réduisant leur impact sur la prédiction finale.
- **Les poids sont ajustés dynamiquement**, assurant un système plus juste et robuste.

---

## **4. Prochaine Étape**

L'étape suivante consiste à **exposer ce système via une API Flask** afin que les prédictions et le slashing puissent être réalisés dynamiquement via des requêtes externes. (**Question 5**).

