# Question 2: Prédiction Consensuelle et Système Distribué

## **1. Objectif**

Dans cette étape, j'ai combiné plusieurs modèles prédictifs pour créer une **prédiction consensuelle**. L'idée est d'obtenir une meilleure robustesse en prenant la moyenne des résultats de plusieurs modèles (Régression Logistique, Random Forest et SVM).

## **2. Implémentation de la Prédiction Consensuelle**

### **Code utilisé :**
```python
import numpy as np
from sklearn.metrics import accuracy_score

# Fonction pour générer une prédiction consensuelle
def consensus_prediction(input_data):
    """
    Génère une prédiction consensuelle en moyennant les résultats de plusieurs modèles.
    :param input_data: Données d'entrée sous forme de tableau numpy.
    :return: Prédiction finale (0 ou 1).
    """
    # Obtenir les prédictions des trois modèles
    pred_logistic = logistic_model.predict_proba(input_data)[:, 1]  # Probabilité de survie
    pred_rf = random_forest_model.predict_proba(input_data)[:, 1]
    pred_svm = svm_model.decision_function(input_data)  # SVM ne donne pas de probas, on normalise
    
    # Normaliser la sortie du SVM entre 0 et 1
    pred_svm = (pred_svm - pred_svm.min()) / (pred_svm.max() - pred_svm.min())
    
    # Faire la moyenne des prédictions
    consensus_pred = (pred_logistic + pred_rf + pred_svm) / 3
    
    # Convertir en 0 ou 1 (seuil 0.5)
    final_prediction = (consensus_pred >= 0.5).astype(int)
    
    return final_prediction

# Tester avec un exemple
test_input = X_test.values
consensus_predictions = consensus_prediction(test_input)

# Évaluer la performance du consensus
accuracy_consensus = accuracy_score(y_test, consensus_predictions)
print("Précision du modèle de consensus :", accuracy_consensus)
```

## **3. Résultats et Analyse**

J'ai comparé la précision du modèle consensuel avec celle des modèles individuels :

| Modèle                | Précision |
| --------------------- | --------- |
| Régression Logistique | **81.0%** |
| Random Forest         | **82.1%** |
| SVM                   | **78.2%** |
| **Modèle Consensus**  | **79.3%** |

Le **modèle consensuel** offre une précision inférieure à Random Forest mais meilleure que SVM.

## **4. Conclusion**

J'ai mis en place un système de **prédiction consensuelle distribuée** qui combine plusieurs modèles. L'approche pourrait être améliorée en ajustant les pondérations des modèles au lieu d'une simple moyenne.

**Prochaine étape :** Intégrer ce modèle dans une API Flask et le rendre accessible via `ngrok` pour une expérimentation sur plusieurs machines (**Question 3**).

