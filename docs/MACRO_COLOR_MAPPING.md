# Macro Klipper `ORCA_COLOR_SETUP`

[English](MACRO_COLOR_MAPPING.en.md) · Français · [Accueil](../README.md)

[`klipper/color_mapping_fluidd.cfg`](../klipper/color_mapping_fluidd.cfg) est une **macro créée pour ce projet**. Elle ajoute un choix interactif des têtes dans Fluidd au début d’un G-code préparé pour l’appeler. Elle n’existe pas dans la configuration WonderMaker d’origine.

Elle constitue un autre parcours que le favori. **Le favori actuel ne l’appelle pas** : il enregistre la correspondance directement avant de démarrer le G-code original. Les deux parcours se rejoignent dans les variables `box_modify_t0` à `box_modify_t3`, que les macros `T0` à `T3` de la machine lisent lors des changements de tête.

## Ce que fait la macro

1. Le G-code appelle `ORCA_COLOR_SETUP` avec les outils utilisés et leurs couleurs.
2. La macro affiche une invite Fluidd pour chaque couleur et met l’impression en pause avec `M25`.
3. L’utilisateur choisit une tête physique T0–T3 pour chaque couleur. Une tête réutilisée pour plusieurs couleurs déclenche un avertissement.
4. L’écran récapitule les choix. **Confirmer et imprimer** écrit `box_modify_tN` et `box_modify_tN_backup`, puis `M24` reprend le G-code.
5. Lorsqu’une commande `T0`–`T3` arrive plus tard dans le G-code, la macro WonderMaker correspondante lit `box_modify_tN` et appelle `_CHANGE_TOOL` avec la tête physique choisie.

Exemple : si la couleur du fichier `T0` est affectée à la tête physique `T2`, `box_modify_t0` vaut `2`. La commande `T0` du G-code déclenche alors `_CHANGE_TOOL T=2`.

## Installer sur l’imprimante

L’installation n’est utile que pour le **parcours avec invite Fluidd**. Elle modifie la configuration Klipper ; faites-la lorsque l’imprimante ne travaille pas.

1. Sauvegardez `printer.cfg` et le fichier des variables enregistrées de l’imprimante.
2. Dans l’éditeur de configuration de Fluidd, placez [`color_mapping_fluidd.cfg`](../klipper/color_mapping_fluidd.cfg) dans le même dossier de configuration que `printer.cfg`.
3. Ajoutez `[include color_mapping_fluidd.cfg]` dans `printer.cfg`, après les inclusions de configuration WonderMaker. Ne dupliquez pas cette ligne si elle existe déjà.
4. Enregistrez, puis redémarrez Klipper depuis Fluidd. Vérifiez qu’aucune erreur de configuration n’apparaît.

La macro suppose que la configuration de la machine fournit déjà `[save_variables]`, `[respond]`, `[virtual_sdcard]`, les macros `T0`–`T3` et `_CHANGE_TOOL` qui lisent les variables `box_modify_tN`. Vérifiez ces éléments dans la configuration de votre imprimante ; les fichiers du constructeur ne sont pas fournis dans ce dépôt.

## Appeler depuis un G-code

L’appel doit figurer **avant la première commande dépendant d’un outil** (`T0`–`T3`, ou chauffage ciblé d’une tête). Le favori n’ajoute pas cet appel : ce parcours nécessite un G-code préparé séparément.

```gcode
ORCA_COLOR_SETUP USED=02 C0=000000 C2=FFFFFF
```

Dans cet exemple, seuls les outils logiques `T0` et `T2` sont utilisés. `USED` contient leurs chiffres dans l’ordre croissant, sans virgule ; chaque `C0`–`C3` utilisé reçoit six chiffres hexadécimaux **sans `#`**. Ce sont les couleurs prévues dans le fichier, pas les numéros des têtes physiques. Les têtes physiques sont choisies dans l’invite Fluidd.

Pour un autre fichier, adaptez `USED` et les paramètres `C0`–`C3` aux outils et couleurs réellement présents dans son G-code. Ne recopiez pas l’exemple tel quel pour une impression différente.

## Pendant l’utilisation

- Si l’invite a été masquée, la commande `COULEURS_REOUVRIR` la réaffiche tant qu’un choix est en attente.
- `COULEURS_ANNULER` annule une impression en attente de correspondance.
- `COLOR_MAPPING_STATUS` affiche la correspondance enregistrée.
- L’option **Recommencer** efface les choix de cette invite et recommence à la première couleur.

Les libellés de l’invite fournie par cette macro sont actuellement en français. Le favori de navigateur possède, lui, une interface française et anglaise.

## État des essais

Le parcours initial avec G-code préparé et macro Klipper a terminé une impression avec la correspondance identité `T0→T0`, `T1→T1`, `T2→T2`, `T3→T3`. Cela ne valide pas à lui seul une correspondance différente dans ce parcours. Les essais avec des têtes réaffectées ont réussi avec **le favori**, qui écrit directement les mêmes variables ; ils ne valident pas le parcours de cette macro avec une réaffectation.

Références Klipper : [inclusion de fichiers et modules de configuration](https://www.klipper3d.org/Config_Reference.html), [commandes `M24` et `M25`](https://www.klipper3d.org/G-Codes.html).
