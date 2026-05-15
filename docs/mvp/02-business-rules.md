# 02 — Règles métier indispensables

## Contrats: états et transitions

États contractuels MVP:
- `ACTIVE`
- `LATE`
- `SUSPENDED`
- `TERMINATED`

Transitions:
- `ACTIVE -> LATE`: au moins une échéance dépassée non payée.
- `LATE -> SUSPENDED`: seuil d’impayés atteint.
- `SUSPENDED -> ACTIVE`: paiement(s) régularisé(s) + validation admin.
- `ACTIVE|LATE|SUSPENDED -> TERMINATED`: résiliation administrative.

Règle véhicule liée:
- Si contrat `SUSPENDED`, véhicule associé `IMMOBILIZED`.
- À réactivation validée, véhicule peut revenir `ACTIVE`.

## Recouvrement: retard, pénalité, relance, suspension

- Échéance dépassée: paiement `OVERDUE`.
- Pénalité: configurable par opération comptable (champ `penaltyAmount`).
- Relances minimales:
  - J+1: notification chauffeur
  - J+3: notification chauffeur + flotte
  - J+7: alerte comptable + proposition suspension
- Suspension automatique MVP:
  - seuil par défaut: 2 échéances `OVERDUE` sur un contrat.

## Maintenance: déclencheurs et escalades

Déclencheurs:
- Date de prochaine maintenance atteinte
- Kilométrage seuil atteint

Niveaux d’escalade:
- Niveau 1: alerte flotte
- Niveau 2 (retard > 48h): alerte flotte + admin
- Niveau 3 (critique sécurité): immobilisation préventive véhicule

Traçabilité obligatoire:
- horodatage, acteur, action, justification
