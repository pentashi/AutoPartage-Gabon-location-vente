# 01 — Périmètre MVP figé

## Modules inclus au lancement

- GPS temps réel
  - Position véhicule
  - État connexion tracker
  - Commandes immobilisation/déblocage
- Maintenance
  - Planification par date et kilométrage
  - Alertes préventives
  - Suivi statut intervention
- Notifications
  - In-app (obligatoire)
  - SMS / WhatsApp / Email (selon disponibilité fournisseur)

## Rôles MVP et permissions minimales

- Super Admin / Admin principal
  - Gestion complète utilisateurs, contrats, véhicules, actions critiques
- Flotte
  - Suivi véhicules, maintenance, incidents, demande d’action GPS
- Comptable
  - Gestion paiements, relances, pénalités, validation encaissements
- Chauffeur
  - Consultation affectation, échéances, notifications et incidents
- Garage
  - Consultation ordres de maintenance assignés, mise à jour intervention

## Flux critiques validés

1. Impayé détecté
2. Contrat passe en `LATE` puis `SUSPENDED` selon règles recouvrement
3. Véhicule lié passe en `IMMOBILIZED`
4. Paiement confirmé et rapproché
5. Admin déclenche déblocage et reprise du contrat (`ACTIVE`)

## Hors périmètre MVP

- Boutique / services monétisés
- Protection sociale automatisée complète
- IA prédictive et score risque avancé
- Applications mobiles dédiées chauffeur/garage (hors web admin)
