---
name: shopify-branch-workflow
description: Automatise la création de branches Git pour le développement d'un thème Shopify depuis la branche dev. Vérifie que les dernières modifications du thème ont bien été pull avant de créer la branche, propose de le faire via le Shopify CLI si ce n'est pas le cas, puis crée et checkout une branche nommée en kebab-case avec le préfixe feat/ (nouvelle fonctionnalité) ou fix/ (correction). À utiliser dès que l'utilisateur demande de créer une nouvelle branche, de démarrer une feature, ou de corriger un bug sur le thème Shopify, même s'il ne mentionne pas explicitement "pull" ou "branche dev".
---

# Workflow de création de branche - Thème Shopify

## Objectif

Ce skill encadre la création d'une nouvelle branche Git de travail à partir de la branche `dev` d'un thème Shopify, en s'assurant que `dev` est à jour avant de bifurquer.

## Outils autorisés

Seules les commandes suivantes peuvent être exécutées dans ce workflow :

- `git` (branch, checkout, status, pull, etc.)
- `shopify` (Shopify CLI, notamment `shopify theme pull`)

N'utilise aucun autre outil ou commande pour accomplir ce workflow.

## Étapes du workflow

### 1. Vérifier que les dernières modifications ont été pull

Demande à l'utilisateur :

> As-tu bien pull les dernières modifications du thème depuis Shopify ?

Réponse attendue : oui / non.

- **Si oui** → passe directement à l'étape 3 (création de la branche).
- **Si non** → passe à l'étape 2.

### 2. Proposer de pull les modifications

Demande à l'utilisateur :

> Souhaites-tu pull les dernières modifications maintenant ?

- **Si non** → informe l'utilisateur que tu poursuis sans pull à jour, puis passe à l'étape 3.
- **Si oui** → demande :

  > Quel est le nom du thème Shopify à pull ?

  Une fois le nom fourni par l'utilisateur, exécute la commande suivante en remplaçant `[nom-du-theme]` par le nom exact fourni :

  ```
  shopify theme pull --[nom-du-theme]
  ```

  Par exemple, si l'utilisateur répond `dev-theme`, exécute :

  ```
  shopify theme pull --dev-theme
  ```

  > Note : si cette syntaxe de flag renvoie une erreur côté Shopify CLI (le flag attendu est habituellement `--theme=<nom>`), signale-le à l'utilisateur et demande comment corriger avant de continuer.

  Une fois le pull terminé, passe à l'étape 3.

### 3. Déterminer le type de branche

Demande à l'utilisateur si la branche concerne une **feature** ou un **fix** :

> Est-ce une feature ou un fix ?

- Feature → préfixe `feat/`
- Fix → préfixe `fix/`

### 4. Demander le nom de la branche

Demande à l'utilisateur de décrire brièvement l'objet de la branche (ex : "carte produit", "correction du panier mobile").

Convertis cette description en **kebab-case** (minuscules, mots séparés par des tirets, sans accents ni caractères spéciaux).

Le nom doit être en anglais.

Construis le nom final de la branche :

```
<prefixe>/<nom-en-kebab-case>
```

Exemples :

- Feature "product card" → `feat/product-card`
- Fix "correction du panier mobile" → `fix/correction-panier-mobile`

### 5. Créer et checkout la branche

Exécute dans l'ordre :

```bash
git branch <nom-de-la-branche>
git checkout <nom-de-la-branche>
```

Confirme à l'utilisateur que la branche a été créée et qu'il est maintenant positionné dessus.

## Résumé du flux

```
Demande création de branche
        │
        ▼
Pull à jour ? ──non──▶ Pull maintenant ? ──oui──▶ Nom du thème ──▶ shopify theme pull --[nom]
        │oui                    │non
        ▼                       │
        └───────────────────────┘
        ▼
Feature ou fix ?
        │
        ▼
Nom de la branche (kebab-case)
        │
        ▼
git branch <nom> && git checkout <nom>
```
