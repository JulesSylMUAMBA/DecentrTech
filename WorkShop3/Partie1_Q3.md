# Question 3: Introduction d’un Système de Pondération

## **1. Objectif**

Pour améliorer la prédiction consensuelle, j'ai introduit un **système de pondération** basé sur la précision des modèles. Chaque modèle reçoit un poids entre **0 et 1**, qui reflète sa fiabilité.

L'idée est de donner plus d'importance aux modèles les plus performants pour affiner la décision finale.

---

## **2. Implémentation de la Prédiction Pondérée**

### **Stratégie utilisée :**
- Chaque modèle reçoit un **poids initial basé sur sa précision** mesurée précédemment.
- La prédiction finale est une **moyenne pondérée** des prédictions des modèles.
- Les poids sont normalisés pour que leur somme soit égale à 1.

### **Code utilisé :**
```python
# Initialisation des poids des modèles en fonction de leur précision
model_accuracies = {
    "logistic": accuracy_logistic,
    "random_forest": accuracy_rf,
    "svm": accuracy_svm
}

# Normalisation des poids
total_accuracy = sum(model_accuracies.values())
model_weights = {k: v / total_accuracy for k, v in model_accuracies.items()}

# Fonction pour générer une prédiction pondérée
def weighted_consensus_prediction(input_data):
    """
    Génère une prédiction pondérée en fonction de la précision des modèles.
    """
    pred_logistic = logistic_model.predict_proba(input_data)[:, 1]
    pred_rf = random_forest_model.predict_proba(input_data)[:, 1]
    pred_svm = svm_model.decision_function(input_data)
    pred_svm = (pred_svm - pred_svm.min()) / (pred_svm.max() - pred_svm.min())
    
    weighted_pred = (
        model_weights["logistic"] * pred_logistic +
        model_weights["random_forest"] * pred_rf +
        model_weights["svm"] * pred_svm
    ) / sum(model_weights.values())
    
    final_prediction = (weighted_pred >= 0.5).astype(int)
    return final_prediction

# Tester avec un exemple
test_sample = X_test.iloc[:1].values
print("Prédiction pondérée :", weighted_consensus_prediction(test_sample))
```

---

## **3. Résultats et Analyse**

J'ai comparé la précision du modèle pondéré avec les autres modèles :

| Modèle                   | Précision |
|--------------------------|------------|
| Régression Logistique    | **81.0%**  |
| Random Forest            | **82.1%**  |
| SVM                      | **78.2%**  |
| **Consensus Model**      | **79.3%**  |
| **Weighted Consensus Model** | **79.3%**  |

🔹 **Analyse** :
- Le modèle **Random Forest reste le plus performant**.
- La **prédiction pondérée ne fait pas mieux que le consensus simple** (79.3%).
- L’amélioration serait d’ajuster les poids dynamiquement après chaque batch de prédictions.

---

## **4. Prochaine Étape**

L'étape suivante consiste à **introduire un mécanisme d'adaptation des poids après chaque prédiction batch**, afin d’améliorer la robustesse du système. (Question 4)
