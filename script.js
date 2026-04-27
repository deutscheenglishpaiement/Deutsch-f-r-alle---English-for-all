const data = {
  anglais: {
    A1: 30000,
    A2: 40000,
    B1: 60000,
    B2: 80000,
    C1: 100000
  },
  allemand: {
    A1: 60000,
    A2: 75000,
    B1: 95000,
    B2: 110000
  }
};

// ELEMENTS
const form = document.getElementById("formPaiement");
const langue = document.getElementById("langue");
const niveau = document.getElementById("niveau");
const prix = document.getElementById("prix");

const typePaiement = document.getElementById("typePaiement");
const blocPartiel = document.getElementById("blocPartiel");
const montantPaye = document.getElementById("montantPaye");

const inputNom = document.getElementById("nom");
const inputPrenom = document.getElementById("prenom");
const inputNumero = document.getElementById("numero");
const inputEmail = document.getElementById("email");

let prixActuel = 0;
let isProcessing = false;

/* RESET NIVEAU */
function resetNiveau() {
  niveau.innerHTML = "<option value=''>Choisir un niveau</option>";
  prixActuel = 0;
  prix.textContent = "0";
}

/* LANGUE CHANGE */
langue.addEventListener("change", () => {
  resetNiveau();

  if (!data[langue.value]) return;

  Object.keys(data[langue.value]).forEach(niv => {
    const opt = document.createElement("option");
    opt.value = niv;
    opt.textContent = niv;
    niveau.appendChild(opt);
  });
});

/* NIVEAU CHANGE */
niveau.addEventListener("change", () => {
  prixActuel = data[langue.value]?.[niveau.value] || 0;
  prix.textContent = prixActuel.toLocaleString();
});

/* TYPE PAIEMENT */
typePaiement.addEventListener("change", () => {
  blocPartiel.style.display =
    typePaiement.value === "partiel" ? "block" : "none";
});

/* VALIDATION TEXTES */
[inputNom, inputPrenom].forEach(input => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
  });
});

/* VALIDATION NUMERO */
inputNumero.addEventListener("input", () => {
  inputNumero.value = inputNumero.value.replace(/[^0-9+]/g, "");
});

/* SUBMIT */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (isProcessing) return;
  isProcessing = true;

  const btn = form.querySelector("button");
  btn.textContent = "Traitement...";
  btn.disabled = true;

  const nom = inputNom.value.trim();
  const prenom = inputPrenom.value.trim();
  const numero = inputNumero.value.trim();
  const email = inputEmail.value.trim();

  if (!nom || !prenom || !numero || !email || !langue.value || !niveau.value) {
    alert("⚠️ Remplis toutes les informations");
    return reset();
  }

  if (!/^\+?[0-9]{8,15}$/.test(numero)) {
    alert("⚠️ Numéro invalide");
    return reset();
  }

  let montant = prixActuel;

  if (typePaiement.value === "partiel") {
    montant = Number(montantPaye.value);

    if (isNaN(montant) || montant <= 0) {
      alert("⚠️ Montant invalide");
      return reset();
    }
  }

  try {
    const res = await fetch("https://deutsch-english-backend-9hn6.onrender.com/paiement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom,
        prenom,
        numero,
        email,
        langue: langue.value,
        niveau: niveau.value,
        montant
      })
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.message || "Erreur paiement");
      return reset();
    }

    if (result.url) {
      window.location.href = result.url;
    } else {
      alert("Lien de paiement introuvable");
      return reset();
    }

  } catch (err) {
    console.log(err);
    alert("Erreur serveur");
    reset();
  }
});

/* RESET SAFE */
function reset() {
  const btn = form.querySelector("button");
  btn.textContent = "PAYER";
  btn.disabled = false;
  isProcessing = false;
}