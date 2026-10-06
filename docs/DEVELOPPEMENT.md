# Fonctionnement et maintenance

[English](DEVELOPMENT.en.md) · Français · [Guide utilisateur](../README.md)

## Périmètre

Le favori est prévu pour la WonderMaker ZR Ultra S avec Fluidd/Moonraker, les variables `box_modify_t0` à `box_modify_t3`, le fichier de configuration `tmt1.ini` et les capteurs `filament0` à `filament3`. Ce n’est pas une extension universelle de Fluidd. Le code utilise l’adresse de la page Fluidd ouverte et vérifie la présence de Moonraker.

Le navigateur lit la liste des G-code déjà présents sur l’imprimante, puis les couleurs et outils utilisés dans les commentaires OrcaSlicer à la fin du fichier choisi. Il ne crée pas de copie modifiée du G-code.

## Deux parcours vers la même correspondance

Les macros `T0` à `T3` de la configuration WonderMaker lisent `box_modify_t0` à `box_modify_t3` et appellent `_CHANGE_TOOL` avec le numéro physique obtenu. Le dépôt contient deux façons de renseigner ces variables :

| Parcours | Source de la correspondance | Début du G-code |
| --- | --- | --- |
| Favori de navigateur | `SAVE_VARIABLE` envoyé par Moonraker avant le lancement | G-code original, sans appel à `ORCA_COLOR_SETUP`. |
| [Macro `ORCA_COLOR_SETUP`](MACRO_COLOR_MAPPING.md) | Invite Fluidd, puis `SAVE_VARIABLE` dans la macro | G-code préparé avec un appel à `ORCA_COLOR_SETUP`, suivi d’une pause `M25`. |

Le favori dépend des macros `T0`–`T3` de la configuration WonderMaker compatible, **pas** de `ORCA_COLOR_SETUP`. Avant d’envoyer `SAVE_VARIABLE`, il lit `configfile` via Moonraker et vérifie `[save_variables]`, `_CHANGE_TOOL` et la lecture de `box_modify_tN` par chaque macro `Tn`. Une machine incompatible est refusée avant tout démarrage.

Le fichier `klipper/color_mapping_fluidd.cfg` est une autre méthode créée pour ce projet. Il ne remplace pas les macros `T0`–`T3` et n’est pas à installer pour suivre le parcours du favori.

## Couleurs et présence de filament

- Les codes couleur de l’écran sont lus dans `/server/files/config/tmt1.ini`. Les indices de la palette suivent les pastilles de l’écran, ligne par ligne, à partir de 0. Les valeurs hexadécimales du favori sont approximatives.
- Les objets Klipper `filament_switch_sensor filament0` à `filament3` donnent la présence du filament. Un code couleur seul ne prouve pas qu’une bobine est chargée.
- Le firmware peut désactiver la surveillance des capteurs des têtes inactives (`enabled=false`) et la réactiver lors du changement de tête. Le favori utilise `filament_detected` pour la présence ; une valeur manquante ou inconnue reste bloquante.
- Les capteurs sont relus avant le lancement. Le favori bloque l’impression si une tête sélectionnée est vide ou si l’état d’un capteur ne peut pas être confirmé.
- La couleur est celle déclarée sur l’écran de l’imprimante. Aucun capteur ne mesure la teinte réelle de la bobine.

## Démarrage avec le favori

Après le clic sur **Confirmer et imprimer**, le favori contrôle l’état de la machine et vérifie que le fichier sélectionné n’a pas changé. Il enregistre la correspondance dans les variables `box_modify_tN` et `box_modify_tN_backup`, puis lance le G-code original par Moonraker. Si la demande de démarrage échoue, il vérifie l’état de l’imprimante avant de tenter de restaurer les valeurs précédentes. Il invite à vérifier Fluidd si le résultat du démarrage est incertain.

## Dépannage

| Symptôme | Vérification |
| --- | --- |
| Le favori ne s’ouvre pas | Ouvrir Fluidd, puis lancer le favori depuis sa barre. Vérifier que son adresse commence par `javascript:`. |
| Aucun fichier proposé | Envoyer un fichier `.gcode` à Fluidd ; seuls les fichiers déjà présents sur l’imprimante sont listés. |
| Couleurs du fichier non reconnues | Utiliser un G-code OrcaSlicer qui conserve les commentaires de couleur et d’utilisation du filament. |
| Une tête est indiquée « Vide » | Vérifier le filament et le capteur sur l’imprimante, puis cliquer sur **Actualiser**. |
| La couleur affichée ne correspond pas à la bobine | Corriger la couleur déclarée sur l’écran de l’imprimante et vérifier physiquement la bobine. |
| L’impression est bloquée | Lire le message de la fenêtre ; ne pas relancer si Fluidd montre déjà une impression active. |

## Fichiers actuels

- [`src/favori_couleurs_fluidd.js`](../src/favori_couleurs_fluidd.js) : source du favori.
- [`klipper/color_mapping_fluidd.cfg`](../klipper/color_mapping_fluidd.cfg) : macro interactive du projet ; [installation et fonctionnement](MACRO_COLOR_MAPPING.md).
- [`tools/build_favori.py`](../tools/build_favori.py) : génère [la page d’installation](../dist/Installer_favori_couleurs_Fluidd.html).
- [`tools/check_favori.py`](../tools/check_favori.py), [`tests/test_bookmarklet.js`](../tests/test_bookmarklet.js) et [`tests/fixtures/`](../tests/fixtures/) : contrôles hors ligne.

Pour régénérer et vérifier depuis la racine du dépôt :

```powershell
python tools/build_favori.py
node --check src/favori_couleurs_fluidd.js
python tools/check_favori.py
node tests/test_bookmarklet.js
```

Le favori utilise les routes Moonraker `/server/info`, `/server/files/list`, `/server/files/metadata`, `/server/files/gcodes`, `/server/files/config/tmt1.ini`, `/printer/objects/query`, `/printer/gcode/script` et `/printer/print/start`. La miniature et les informations facultatives du G-code sont chargées uniquement après le choix d’un fichier. Les deux dernières routes ne sont appelées qu’après confirmation.

## Archives techniques

Les [analyses de firmware](comparaison_1.1.08_1.1.12.md) documentent les essais et comparaisons antérieurs. Les copies des macros du constructeur et les correctifs dérivés ne sont pas distribués dans ce dépôt public. Consultez la configuration de votre propre imprimante pour vérifier le mécanisme `T0`–`T3`.

Les archives complètes des firmwares, G-code d’impression, captures d’écran privées et configurations personnelles ne sont pas suivis par Git.
