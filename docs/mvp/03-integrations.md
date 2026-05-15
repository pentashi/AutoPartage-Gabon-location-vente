# 03 — Intégrations critiques MVP

## GPS

Objectif:
- tracking opérationnel et action de contrôle à distance.

Capacités MVP:
- Ingestion position (lat/lng, timestamp, vitesse, ignition)
- Santé tracker (online/offline)
- Commandes: `IMMOBILIZE`, `RELEASE`

Exigences:
- idempotence des commandes
- journalisation complète des actions critiques
- timeout et statut de livraison commande

## Paiements

Objectif:
- fiabilité du statut de paiement et rapprochement comptable.

Capacités MVP:
- enregistrement manuel ou issu d’un provider
- preuve de paiement (référence, canal, date)
- rapprochement avec contrat/échéance

Règles:
- un paiement ne devient `PAID` qu’après validation
- les montants pénalité et principal restent distingués

## Notifications

Objectif:
- exécuter les relances et alertes critiques en temps utile.

Canaux MVP:
- in-app obligatoire
- SMS / WhatsApp / Email activables selon provider

Priorités:
- Critique: suspension, immobilisation, incident sécurité
- Haute: impayé, maintenance urgente
- Normale: rappels échéance et maintenance standard
