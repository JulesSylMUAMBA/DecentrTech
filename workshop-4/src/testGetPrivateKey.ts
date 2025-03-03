
async function testGetPrivateKey() {
    console.log("TEST: Vérification de /getPrivateKey...");

    try {
        const response = await fetch("http://localhost:4000/getPrivateKey"); // Vérifie bien le port ici !
        const text = await response.text();  // On récupère la réponse brute

        console.log("DEBUG: Réponse brute de /getPrivateKey =>", text);

        let data;
        try {
            data = JSON.parse(text);  // On essaie de la convertir en JSON
        } catch (error) {
            console.error("ERROR: Impossible de parser le JSON:", error);
            return;
        }

        console.log("TEST: Réponse reçue =>", data);
        
        if (!data.result) {
            console.error("ERROR: La réponse JSON ne contient pas de clé privée !");
        } else {
            console.log("TEST: Clé privée reçue avec succès !");
        }
    } catch (error) {
        console.error("ERROR: Impossible d'obtenir la clé privée :", error);
    }
}

testGetPrivateKey();
