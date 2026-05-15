# 05 — UX opérationnelle MVP

## Parcours quotidien dashboard (web admin)

1. Vue globale KPI
   - véhicules actifs / immobilisés
   - contrats en retard / suspendus
   - maintenance due aujourd’hui
   - alertes critiques
2. Traitement prioritaire des alertes
3. Action corrective (paiement, immobilisation/déblocage, maintenance)
4. Vérification de clôture et audit des actions

## Écrans MVP prioritaires

- Console alertes
  - filtres par criticité, type, état
  - actions rapides contextuelles
- Gestion impayés
  - liste échéances en retard
  - relance, pénalité, suspension
- Gestion maintenance
  - planning, retard, statut intervention
- Détail véhicule/contrat
  - historique statuts, paiements, incidents, actions GPS

## États UX obligatoires

- États vides explicites (aucune alerte, aucun impayé)
- États d’erreur actionnables (cause + action recommandée)
- Confirmations d’actions sensibles
  - suspension contrat
  - immobilisation véhicule
  - déblocage véhicule
- Historique et journal utilisateur sur actions critiques
