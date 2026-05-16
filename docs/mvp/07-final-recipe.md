# 07 — Recette finale MVP et gel de périmètre

## Scénarios bout-en-bout obligatoires

1. Impayé détecté -> relance -> suspension -> immobilisation
2. Paiement régularisé -> rapprochement -> déblocage -> réactivation
3. Alerte maintenance -> assignation -> intervention -> clôture
4. Incident sécurité -> alerte critique -> traçabilité action admin

## Critères d’acceptation MVP

- Flux critiques passants sans blocage
- Cohérence des statuts contrat/vehicule/paiement
- Notifications envoyées avec bonne priorité
- Actions sensibles confirmées et auditables
- Dashboard utilisable quotidiennement par exploitation

## Gestion des corrections bloquantes

- Classification: Critique / Majeur / Mineur
- SLA recette:
  - Critique: correction immédiate avant go-live
  - Majeur: correction avant signature sortie
  - Mineur: bascule backlog post-MVP

## Signature de sortie MVP

Conditions de signature:
- 100% scénarios critiques validés
- 0 bug critique ouvert
- 0 bug majeur non contourné
- validation conjointe Produit + Ops + Tech

## Gel de périmètre

Après signature:
- toute nouvelle demande passe en backlog post-MVP
- aucune extension de scope sans arbitrage formel

## Exécution opérationnelle

La checklist d’exécution MVP 100% (jour par jour) est disponible dans:
- `docs/mvp/08-mvp-100-checklist.md`
