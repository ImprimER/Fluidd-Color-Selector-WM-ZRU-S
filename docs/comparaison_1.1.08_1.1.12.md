# Wondermaker ZR Ultra S — comparaison des sauvegardes 1.1.08 et 1.1.12

Analyse des deux archives fournies par le propriétaire. Les numéros de version sont ceux indiqués par le propriétaire et les noms d’archives ; les fichiers ne contiennent pas d’attestation indépendante du firmware installé.

> Rapport historique. Les archives de firmware, les copies des macros du constructeur, les inventaires et les correctifs mentionnés dans le texte ne sont pas distribués dans ce dépôt. Seuls les constats et explications sont conservés ici.

## Constat

Les deux archives examinées contenaient les **mêmes 29 chemins**. **26 fichiers étaient identiques octet par octet** ; trois étaient modifiés. Aucune disparition ou création de fichier. Un diff intégral et un inventaire avec SHA-256 avaient été produits pendant l’analyse ; ils ne font pas partie de ce dépôt.

| Fichier | Modification certaine | Effet probable |
|---|---|---|
| `printer.cfg` | Les quatre `rotation_distance` individualisées deviennent toutes `21.018`. `max_accel` passe de 5000 à 20000 mm/s². | Les calibrations d’extrusion par tête ont été écrasées ou réinitialisées ; l’accélération demandée peut atteindre quatre fois l’ancienne limite. |
| `change_macros.cfg` | Dans `_raise_z` et `_descend_z`, `SAVE_GCODE_STATE` / `RESTORE_GCODE_STATE` sont remplacés par `G91` / `G90` autour du mouvement Z. | Le mode de déplacement précédent n’est plus restauré. Un appel pendant des mouvements relatifs peut laisser l’interpréteur en mode absolu. |
| `zru-s.cfg` | Deux sections de boutons de porte passent de lignes commentées à des sections actives. | Deux entrées matérielles sont désormais déclarées. Leur comportement réel dépend du firmware et du câblage ; `press_gcode` et `release_gcode` sont vides. |

## Détail des calibrations d’extrusion

| Tête | Avant 1.1.08 | Après 1.1.12 | Écart de longueur extrudée estimé si l’ancienne valeur était correctement calibrée |
|---|---:|---:|---:|
| T0 | 20.597 | 21.018 | environ −2,0 % |
| T1 | 20.808 | 21.018 | environ −1,0 % |
| T2 | 21.228 | 21.018 | environ +1,0 % |
| T3 | 21.438 | 21.018 | environ +2,0 % |

L’estimation utilise le rapport `ancienne rotation_distance / nouvelle rotation_distance − 1`. Elle suppose que les anciennes valeurs avaient été obtenues par calibration et que le mécanisme d’extrusion n’a pas changé. C’est la perte de réglages propres aux quatre têtes la plus nette dans ces sauvegardes. Les valeurs exactes sont dans le correctif proposé.

## Autres modifications et conservation

La nouvelle limite `max_accel: 20000` peut être une évolution volontaire de la version 1.1.12. Les macros utilisent cette limite de configuration pour rétablir l’accélération au démarrage et à la fin d’une impression ; ce changement est donc susceptible d’être appliqué. Il mérite un essai progressif et une vérification de la qualité d’impression avant de décider de conserver 20000 ou de revenir à 5000.

Le remplacement de la sauvegarde de l’état G-code par `G90` change davantage qu’une question de présentation : la version précédente rétablissait le mode absolu/relatif du contexte appelant. La version 1.1.12 force le mode absolu. Un correctif non distribué proposait de restaurer uniquement les deux blocs précédents. Aucune validation sur la machine n’a été faite ; il faut vérifier la compatibilité de cette macro avec le reste du firmware 1.1.12 avant application.

Les sections `Door_button1` et `Door_button2` sont maintenant actives sur PA7 et PB7. Elles ne contiennent aucune action d’appui ou de relâchement dans les fichiers fournis. Leur activation peut servir à l’interface ou à des extensions du constructeur absentes de ces archives. Le correctif ne les désactive pas.

**Les anciennes corrections apparentes sont toujours présentes à l’identique** : `_WAIT_TOOL_TEMPERATURE` attend la tête physique active ; M104/M109 tiennent compte de la correspondance d’outils ; PAUSE/RESUME gèrent cette correspondance lors de l’arrêt et du réchauffage ; les diagnostics de dépôt/verrouillage des têtes sont conservés. `macros.cfg`, `saved_variables.cfg`, `offset_calibrate.cfg`, les quatre fichiers `extruder*.cfg`, les identifiants CAN, les valeurs PID, les offsets XYZ, le maillage et l’input shaper sont strictement identiques. Les observations et points de vigilance du rapport 1.1.08 restent donc applicables dans le périmètre de ces fichiers.

## Proposition de restauration ciblée

Un correctif privé proposait de remettre les quatre distances d’extrusion calibrées et la préservation de l’état G-code dans les deux macros Z. Il gardait `max_accel: 20000` et les deux boutons de porte actifs, pour permettre une décision séparée sur ces nouveautés. Aucun fichier de l’imprimante n’a été modifié par cette analyse.

Avant toute application, confirmer que les anciennes distances correspondaient bien à une calibration intentionnelle ; ensuite sauvegarder l’état actuel de l’imprimante et vérifier le fonctionnement des quatre extrudeurs et des changements de tête sur la machine. Les autres parties du firmware ou des extensions constructeur n’ont pas été fournies : cette comparaison porte sur les **29 fichiers des deux archives** uniquement, et ne prouve pas qu’aucun autre composant n’a changé.

## Rapport associé

L’[analyse de la version 1.1.08](analyse_1.1.08.md) est conservée dans ce dépôt. Les fichiers de firmware et les autres livrables de l’analyse restent hors du dépôt public.
