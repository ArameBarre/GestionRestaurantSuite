const formAuth = document.getElementById('form-auth');
const inputIdentifiant = document.getElementById('input-identifiant');
const inputMotPasse = document.getElementById('input-mot-passe');
const formErreur = document.getElementById('form-erreur')

async function connexion(event) {
	event.preventDefault();

	let data = {
		courriel: inputIdentifiant.value,
		mot_de_passe: inputMotPasse.value
	};

	let response = await fetch('/api/connexion', {
		method: 'POST', 
		headers:{ 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	
	if (response.ok){
		location.replace('/');
	} else if (response.status === 409){
		let info = await response.json();
		console.log(info)
		if (info.erreur === 'mauvais_utilisateur'){
			formErreur.innerText = 'Identifiant inexistant';
		}
		else if (info.erreur === "mauvais_mot_passe")
			formErreur.innerText = 'Mauvais mot de passe';
	}	
}

formAuth.addEventListener('submit', connexion);