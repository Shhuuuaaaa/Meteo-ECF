# Météo-ECF

Application météo en temps réel avec un design moderne et des effets visuels dynamiques.

---

## Fonctionnement

Au chargement, l'application demande l'accès à votre position GPS pour afficher automatiquement la météo de votre emplacement. Si la permission est refusée, Paris est utilisé par défaut.

La barre de recherche permet de trouver n'importe quelle ville dans le monde avec autocomplétion. Les villes consultées peuvent être sauvegardées en favoris pour y accéder en un clic.

L'interface s'adapte aux conditions météo en temps réel : fond animé, effets de pluie ou de soleil selon la météo détectée. Les données affichées couvrent la météo actuelle, les prévisions heure par heure, les prévisions sur 7 jours ainsi qu'une carte interactive avec les précipitations radar et la couverture nuageuse satellite.

Les températures sont affichables en Celsius ou Fahrenheit.

---

## Installation

```bash
npm install
```

Créer un fichier `.env.local` à la racine :

```env
WEATHER_API_KEY=votre_clé_weatherapi_ici
```

```bash
npm run dev
```

---

## Déploiement

L'application est déployée sur Vercel. La clé API doit être renseignée dans les variables d'environnement du projet : `WEATHER_API_KEY`.

---

Fait par **Joshua Prevost** · 2026
