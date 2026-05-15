# AutoPartage Gabon

Plateforme de **location-vente de véhicules** avec suivi opérationnel, financier, maintenance et sécurité pour une flotte professionnelle au Gabon.

> Nom de projet recommandé : **autopartage-gabon-platform**  
> (le dépôt GitHub actuel est `pentashi/cars`).

## Vision

Construire une plateforme unifiée pour :
- gérer la flotte en temps réel,
- piloter les contrats location-vente,
- suivre les chauffeurs et leurs performances,
- automatiser maintenance, alertes et immobilisations GPS,
- centraliser finance, documents, audit et analytics.

## Rôles principaux

- **Super Admin / Admin principal**
- **Flotte**
- **Comptable**
- **Chauffeur**
- **Garage**

## Modules produit

- Vue d’ensemble (dashboard global)
- Chauffeurs
- Contrats
- Flotte / Véhicules
- GPS temps réel (incluant immobilisation à distance)
- Maintenance & rappels
- Finance & versements
- Boutique / Services
- Garages
- Incidents
- Notifications
- Documents
- Analytics
- Sécurité & Audit

## Aperçu fonctionnel (données fournies)

- **Véhicules actifs** : 120 (97 en circulation, 8 immobilisés)
- **Chauffeurs** : 118
- **Revenus (mai)** : 78,0M FCFA
- **Taux de recouvrement** : 89%
- **Alertes actives** : 21

Cas clés déjà décrits :
- Immobilisation automatique en cas d’impayé
- Déblocage admin après paiement
- Rappels maintenance par date/km
- Alertes assurance / visite technique
- Suivi des contrats (actif, retard, suspendu, résilié)

## Roadmap

- **Phase 1 — Terminée** : Auth, Chauffeurs, Véhicules, Contrats, Paiements
- **Phase 2 — MVP figé** : GPS, Maintenance, Notifications (spécifications prêtes)
- **Phase 3 — Planifiée** : Boutique, Garages, Protection sociale
- **Phase 4 — IA** : Score risque, Analytics avancé, IA prédictive

## Documentation MVP Phase 2

- Dossier de finalisation: [`docs/mvp/README.md`](./docs/mvp/README.md)
- Périmètre figé: [`docs/mvp/01-mvp-scope.md`](./docs/mvp/01-mvp-scope.md)
- Règles métier: [`docs/mvp/02-business-rules.md`](./docs/mvp/02-business-rules.md)
- Intégrations: [`docs/mvp/03-integrations.md`](./docs/mvp/03-integrations.md)
- Données/API: [`docs/mvp/04-data-api.md`](./docs/mvp/04-data-api.md)
- UX opérationnelle: [`docs/mvp/05-ux-operations.md`](./docs/mvp/05-ux-operations.md)
- Go-live GCP: [`docs/mvp/06-gcp-go-live.md`](./docs/mvp/06-gcp-go-live.md)
- Recette finale: [`docs/mvp/07-final-recipe.md`](./docs/mvp/07-final-recipe.md)

## Informations à compléter (sections manquantes à partager)

Pour finaliser le cadrage produit et technique, il manque surtout :

1. **Périmètre MVP exact**
   - fonctionnalités obligatoires au lancement vs plus tard.
2. **Règles métier détaillées**
   - formule score risque, logique de suspension, seuils immobilisation.
3. **Processus financiers**
   - moyens de paiement, rapprochement, pénalités, échéanciers, relances.
4. **Spécifications GPS**
   - fournisseur tracker/API, fréquence remontée, zones blanches, commandes à distance.
5. **Maintenance**
   - types d’interventions, SLA garage, validation coûts, workflow avant/après photos.
6. **Gestion documentaire**
   - types de documents, expirations, signature, archivage.
7. **Sécurité & conformité**
   - matrice de permissions par rôle, journal d’audit, politique de conservation.
8. **Intégrations externes**
   - CNSS/CNAMGS, mobile money, SMS/WhatsApp/email, cartographie.
9. **Applications cibles**
   - web admin seulement ou aussi app chauffeur/garage (iOS/Android).
10. **Exigences non-fonctionnelles**
    - performance, disponibilité, sauvegarde, reprise incident, multi-agence.

## Priorité recommandée (prochaine étape)

1. Valider MVP (fonctionnel + rôles + flux critiques).
2. Figer le dictionnaire de données (chauffeur, véhicule, contrat, versement, incident).
3. Définir les API/integrations critiques (GPS, paiements, notifications).
4. Finaliser maquettes UX par module.

## Licence

À définir.
