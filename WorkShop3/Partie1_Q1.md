# Question 1: Développement de Modèles Prédictifs sur le Titanic Dataset

## Etant donné que j'étais absent lors de la séance, j'ai quand-même fait le travail en dévélopper 3 modèles mais en étant seul.
## **1. Choix du Dataset**
J'ai choisi le dataset **Titanic**, qui est un problème de **classification** visant à prédire si un passager a survécu ou non (étiquette `Survived`).
![image](https://github.com/user-attachments/assets/ba31cf8b-1584-4746-ab77-1eb98ff18145)

**Variables importantes du dataset :**
- `Survived` (**cible**) : 0 = non, 1 = oui
- `Pclass` : classe du billet (1ère, 2e, 3e)
- `Sex` : genre (male, female)
- `Age` : âge du passager
- `SibSp` : nombre de frères/sœurs/conjoint à bord
- `Parch` : nombre de parents/enfants à bord
- `Fare` : prix du billet
- `Embarked` : port d'embarquement (C, Q, S)

---

## **2. Préparation des Données**

1. **Suppression des colonnes inutiles** (`PassengerId`, `Name`, `Ticket`, `Cabin`)
2. **Gestion des valeurs manquantes**
   - `Age` : remplacé par la médiane
   - `Embarked` : remplacé par la valeur la plus fréquente
3. **Encodage des variables categoriques** (`Sex` et `Embarked`)
4. **Séparation en train/test** (80% entraînement, 20% test)

---

## **3. Entraînement de Modèles Prédictifs**
J'ai testé **trois modèles** pour prédire la survie des passagers :
1. **Régression Logistique**
2. **Random Forest**
3. **Support Vector Machine (SVM)**

#### Code utilisé :

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# Initialiser les modèles
logistic_model = LogisticRegression(max_iter=200)
random_forest_model = RandomForestClassifier(n_estimators=100, random_state=42)
svm_model = SVC(kernel="linear")

# Entraîner les modèles
logistic_model.fit(X_train, y_train)
random_forest_model.fit(X_train, y_train)
svm_model.fit(X_train, y_train)

# Prédictions sur l'ensemble de test
y_pred_logistic = logistic_model.predict(X_test)
y_pred_rf = random_forest_model.predict(X_test)
y_pred_svm = svm_model.predict(X_test)

# Évaluer les performances des modèles
accuracy_logistic = accuracy_score(y_test, y_pred_logistic)
accuracy_rf = accuracy_score(y_test, y_pred_rf)
accuracy_svm = accuracy_score(y_test, y_pred_svm)

# Afficher les résultats
print("Précision Régression Logistique :", accuracy_logistic)
print("Précision Random Forest :", accuracy_rf)
print("Précision SVM :", accuracy_svm)

```
Les précisions obtenues sur l'ensemble de test sont :

| Modèle                 | Précision |
|----------------------|------------|
| Régression Logistique | **81.0%**  |
| Random Forest        | **82.1%**  |
| SVM                 | **78.2%**  |

Le **Random Forest** est le plus performant.

---

## **4. Conclusion**
J'ai réussi à développer plusieurs modèles de prédiction et à évaluer leur performance. 

**Prochaine étape :** Exposer ces modèles via une API Flask (**Question 2**).

