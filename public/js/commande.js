// Liste de tous les <select> pour les commandes
let selects = document.querySelectorAll('.commande select');

/**
 * Modifie l'état d'une commande sur le serveur.
 * @param {InputEvent} event Objet d'information sur l'événement.
 */
const modifyEtatCommande = async (event) => {
    let data = {
        idCommande: parseInt(event.target.parentNode.parentNode.dataset.idCommande),
        idEtatCommande: parseInt(event.target.value)
    };

    await fetch('/commande', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// Ajoute l'exécution de la fonction "modifyEtatCommande" pour chaque <select> 
// lorsque son état change.
for (let select of selects) {
    select.addEventListener('change', modifyEtatCommande)
}

let source = new EventSource('/api/stream');

source.onopen = () => {
    console.log('SSE connection opened');
};

// Ajoute l'exécution de la fonction updateSelectElement comme SSE pour
// que l'etat d'une commande se mette à jour automatiquement
source.addEventListener('modify-etat-commande', (event) => {
    let data = JSON.parse(event.data);
    updateSelectElement(data.idCommande, data.idEtatCommande);
    
});

// Ajoute l'exécution de la fonction updateCommandePage comme SSE pour
// qu'une nouvelle commande s'affiche automatiquement
source.addEventListener('new-commande', (event) => {
    let data = JSON.parse(event.data);
    console.log('New commande received for ' + data.idUtilisateur);

    // Afficher les information de la commande
    console.log('id_commande:', data.derniereCommande.id_commande);
    console.log('date:', data.derniereCommande.date);
    console.log('id_etat_commande:', data.derniereCommande.id_etat_commande);

    // Afficher les informations des produits dans la commande
    data.derniereCommande.produit.forEach((product, index) => {
        console.log(`Product ${index + 1}:`);
        console.log('id_produit:', product.id_produit);
        console.log('chemin_image:', product.chemin_image);
        console.log('nom:', product.nom);
        console.log('quantite:', product.quantite);
    });

    
    updateCommandePage(data.derniereCommande, data.etatDerniereCommande);
});

const updateCommandePage = (newOrder, etatCommande) => {
    // Print order info to verify the data
    console.log('Updating commande page with new data:', newOrder, etatCommande);

    // Accéder les données de la nouvelle commande individuellement 
    const orderId = newOrder.id_commande;
    const orderDate = new Date(newOrder.date).toLocaleString('fr-ca');
    const orderStatus = etatCommande.etat_nom; 
    
    // Accéder l'élément HTML représentant la liste des commandes
    const ulElement = document.querySelector('.commande');

    // Créer un élément <li> représentant la nouvelle commande
    const orderItem = document.createElement('li');
    orderItem.setAttribute('data-id-commande', orderId);

    // Créer le header de la nouvelle commande et y ajouter les données puis ajouter ceci
    // à la commander
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');
    infoDiv.innerHTML = `
        <div class="id">${orderId}</div>
        <div class="date">${orderDate}</div>
        <select>
            <option value="${orderStatus}" selected>${orderStatus}</option>
            <option value="livraison">livraison</option>
            <option value="terminee">terminée</option>
        </select>
    `;
    orderItem.appendChild(infoDiv);

    // Accéder les produits dans la nouvelle commande
    const products = newOrder.produit;

    // Créer un tableau et y insérer chaque produit de la commande
    // sur sa propre ligne
    if (Array.isArray(products)) {
        const productTable = document.createElement('table');
        productTable.classList.add('produit');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th></th>
                <th class="nom">Produit</th>
                <th class="quantite">Quantité</th>
            </tr>
        `;
        productTable.appendChild(thead);

        const tbody = document.createElement('tbody');

        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id-produit', product.id_produit);

            tr.innerHTML = `
                <td><img src="${product.chemin_image}" alt="${product.nom}"></td>
                <td class="nom">${product.nom}</td>
                <td class="quantite">${product.quantite}</td>
            `;

            tbody.appendChild(tr);
        });

        productTable.appendChild(tbody);

        orderItem.appendChild(productTable);
    } else {
        console.error('Products data is not an array:', products);
    }

    ulElement.appendChild(orderItem);
};

const updateSelectElement = (idCommande, idEtatCommande) => {
    // Actualise l'etat selon les données reçues
    let selectElement = document.querySelector(`li[data-id-commande="${idCommande}"] select`);
    if (selectElement) {
        // Attribue la valuer de l'état commande directement 
        selectElement.value = idEtatCommande;
        console.log(`Updated select element for idCommande ${idCommande} to ${idEtatCommande}`);
    } else {
        console.error(`Select element not found for idCommande ${idCommande}`);
    }
};

