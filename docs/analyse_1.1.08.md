# Wondermaker ZR Ultra S — référence avant mise à jour 1.1.12

Analyse du 27 septembre 2026. Version 1.1.08 déclarée par le propriétaire. Source : « Fichiers avant MAJ 1.1.12.zip ».

> Rapport historique. L’archive d’origine, les transcriptions et les inventaires mentionnés ci-dessous ne sont pas distribués dans ce dépôt public. Les constats sont conservés à titre de référence.

## Résultat et limites

Les 29 fichiers de l’archive ont été examinés. La sauvegarde contient la configuration, les macros, les calibrations enregistrées et plusieurs réglages de services/interface. Elle ne contient pas le programme complet de l’imprimante, les extensions Python du constructeur, les journaux, les profils du trancheur ni une image système. Aucun fichier de version ne permet d’attester indépendamment la version 1.1.08.

Une copie exacte de l’archive, un inventaire avec empreintes SHA-256 et une transcription intégrale numérotée accompagnent ce rapport. Aucune modification des fichiers sources, aucune commande envoyée à l’imprimante et aucun test mécanique n’ont été effectués. Les commentaires des fichiers ont été traités comme des éléments à analyser, pas comme des instructions de l’utilisateur.

On peut établir précisément l’état actuel et, avec le prochain dossier, ce que la mise à jour aura modifié. En revanche, sans configuration constructeur vierge 1.1.08 ou historique antérieur, on ne peut pas attribuer avec certitude chaque ligne à une modification personnelle. Les éléments ci-dessous sont distingués entre observations certaines et indices de personnalisation.

## Éléments à comparer en priorité

| Élément | État présent dans la sauvegarde | Pourquoi le suivre |
|---|---|---|
| Température après changement de tête | `_WAIT_TOOL_TEMPERATURE`, change_macros.cfg:505, attend directement le chauffage physique actif ; pas de `M109 Tx` | Commentaire explicite contre une double réaffectation des outils qui ferait chauffer une autre tête. Indice fort de correction ciblée. |
| Commandes M104/M109 | macros.cfg:451 et :480 : avec T, utilisent `box_modify_t*` ; sans T, utilisent l’extrudeur actif | Conserve la distinction outil demandé / tête physique. M109 attend dans une fenêtre ±2,5 °C uniquement si S > 0. |
| Pause et reprise | macros.cfg:145 et :219 : retour à la correspondance 0/1/2/3 avant extinction ; températures restaurées avant la correspondance sauvegardée | Commentaires explicites décrivant la prévention des erreurs de chauffage lorsque les outils sont réaffectés. |
| Identification d’une tête mal déposée | change_macros.cfg:59, :78, :245, :345 : `fail_tool`, erreur -3 et message sur la tête libérée | Indice fort de correction du diagnostic : distinguer la tête déposée de la tête que l’on veut prendre. |
| Extrusion par tête | Quatre `rotation_distance` différentes dans printer.cfg | Réglages individualisés, compatibles avec une calibration personnelle ; origine non démontrée. |
| Pressure advance | 0,032 en configuration et dans les variables, mais 0,04 imposé par la macro de changement | Valeur effective susceptible de différer de celle affichée dans le fichier principal. |
| État du début d’impression | `print_body_ready` remis à False au démarrage/fin/annulation et à True à la fin de START_PRINT | Indice d’ajout, mais aucune lecture de cette variable trouvée dans les fichiers fournis. Utilisateur extérieur éventuel inconnu. |

Ces comportements sont présents avec certitude ; leur origine personnelle reste à confirmer. Les commentaires en anglais ou en chinois ne suffisent pas, à eux seuls, à identifier l’auteur.

## Calibrations et valeurs propres à cette machine

### Extrusion et géométrie des têtes

T0 correspond à `extruder`, puis T1 à `extruder1`, etc. Valeurs exactes de `printer.cfg` et `saved_variables.cfg` :

| Tête | rotation_distance | Offset X | Offset Y | Offset Z | Dock X | Dock Y |
|---|---:|---:|---:|---:|---:|---:|
| T0 | 20.597 | 0 | 0 | 0 | 45.49375 | 339.0625 |
| T1 | 20.808 | 0.125 | 0.1875 | -0.103125 | 107.16875 | 339.2125 |
| T2 | 21.228 | 0.21875 | 0.128125 | -0.139688 | 169.975 | 339.59375 |
| T3 | 21.438 | 0.360938 | 0.228125 | 0.015312 | 231.575 | 339.54375 |

Les anciennes valeurs commentées `25.12` et `22.0175` sont des traces de valeurs antérieures ou alternatives, pas une preuve de leur historique d’utilisation. Les quatre extrudeurs ont un rapport 50:10, 16 micropas, une buse déclarée de 0,4 mm et un filament de 1,75 mm. Le débit mémorisé est 100 % pour chaque tête ; PRINTER_INIT et RESET_FLOW_EXTRUDER peuvent le remettre à 100 %.

Pressure advance : 0,032 pour chaque tête dans `printer.cfg` et `saved_variables.cfg`, lissage 0,02 s. `_CHECK_CHANGE_TOOL` applique explicitement `SET_PRESSURE_ADVANCE ... ADVANCE=0.04` sur le chemin de succès, y compris lorsqu’on redemande une tête déjà active. Une commande ultérieure du trancheur peut encore changer cette valeur. Aucune utilisation des variables `t*_pressure_advance` par les macros fournies n’a été trouvée.

### Chauffages et compensation vibratoire

| Chauffage | Kp | Ki | Kd |
|---|---:|---:|---:|
| T0 | 34.907 | 10.118 | 30.107 |
| T1 | 36.584 | 8.710 | 38.413 |
| T2 | 32.141 | 4.983 | 51.827 |
| T3 | 33.000 | 6.286 | 43.312 |
| Plateau | 71.918 | 0.683 | 1893.231 |
| Chambre | 63.418 | 1.342 | 749.125 |

Les PID des têtes sont dans le bloc `SAVE_CONFIG` de printer.cfg ; les anciennes valeurs ordinaires sont commentées. Ce bloc contient également :

- Offset de sonde Z : **-0,145 mm**.
- Input shaper X : **2hump_ei, 44,8 Hz** ; Y : **zv, 38,8 Hz**.
- Maillage `default` : 7 × 7 points ; valeurs de -0,502187 à -0,105625 mm, soit une étendue de 0,396562 mm. Ce chiffre décrit les valeurs sauvegardées, pas un diagnostic mécanique.
- Maillage `adaptive_mesh` : 4 × 4 points, également sauvegardé.

### Autres valeurs persistantes

- Position d’essuyage : `(-13.0, 240.0)` ; parcours en Y jusqu’à 275.
- Position de capteur sauvegardée : `(299.0, 289.0, 8.295, 6.9, 5.8)`.
- Position nominale dans `tools_calibrate` : `(299.0, 290.0, 8.5, 6.9, 5.8)` : elle diffère de la valeur sauvegardée ; les macros de calibration lisent cette dernière. Les extensions constructeur absentes peuvent aussi intervenir.
- `thr_number = 4`, `unlock_hall = 4952` ; les macros utilisent toutefois un seuil de verrouillage de 4700 et une plage de contrôle Hall de 3450 à 6000.
- Toutes les mesures `t*_center*`, `t*_xy_position*`, `t*_z_position` sont préservées intégralement dans la référence.
- Correspondance des outils et backups : 0→0, 1→1, 2→2, 3→3 au moment de la sauvegarde.

`current_extruder = 1`, `fail_tool = 2`, `changing_tool = 0`, `fail_flag = 0` et les états de reprise sont des états de fonctionnement, pas tous des calibrations à réinjecter après mise à jour. En particulier, `fail_tool = 2` avec `fail_flag = 0` ne prouve pas une panne en cours.

## Organisation et rôle de tous les fichiers

`printer.cfg` inclut 15 fichiers directement, puis les fichiers d’identification des cartes via les sous-configurations. Tous les chemins `[include ...]` rencontrés sont présents dans l’archive. `saved_variables.cfg` est référencé par `[save_variables]` et non par un include.

| Fichier ou groupe | Rôle et constat |
|---|---|
| printer.cfg | Configuration centrale : axes CoreXY, 4 extrudeurs, ventilateurs, référencement, sonde, plateau, maillages, limites et bloc SAVE_CONFIG. |
| macros.cfg | Démarrage/fin, pause/reprise/annulation, température, ventilation, chambre, chargement/déchargement, LED et débit. |
| change_macros.cfg | Prise/dépôt/verrouillage, vérification Hall/docks, retries, offsets, attente de température, positions des têtes et sélection du capteur filament. |
| offset_calibrate.cfg | Calibrations XY/Z des têtes, modes rapide/fin, sauvegarde et affichage des offsets. Dépend d’extensions constructeur absentes de l’archive. |
| saved_variables.cfg | Calibrations de la machine, positions, correspondances d’outils et états persistants. |
| extruder0.cfg à extruder3.cfg (4 fichiers) | Courant moteur 0,6 A, contrôle de chauffe, ventilateur hotend dès 70 °C, capteurs filament/dock et LED. Rupture filament : PAUSE différée de 2,5 s ; insertion automatique avec chauffe à 220 °C sous conditions. |
| change_extruder.cfg | Carte de changement, capteur Hall, deux capteurs de verrouillage, moteur trans_stepper, accéléromètre LIS2DW et point de mesure (150,135,20). |
| hub.cfg | Quatre capteurs de parcours filament, avec pause automatique activée. |
| load_cell.cfg | Capteur de force `probe_air` : tension 4,95, delta_v 0,05, delta_v_o 0,005 ; sorties GANTRY/LEVELING et séquences de déclenchement. |
| fz-wipe-nozzle.cfg | Essuyage, variante avec palpage et calibration de position d’essuyage. L’en-tête comporte la date 2025/12/25, qui n’atteste pas une modification personnelle. |
| test_macro.cfg | Tests de puissance, axes, têtes, plateau, sonde, ventilation ; fichier inclus et donc macros accessibles. Aucun test exécuté. |
| zru-s.cfg | Chauffage de chambre, PID, deux ventilateurs de chambre et extraction `air_fan`. Deux entrées de portes sont entièrement commentées. |
| wm_zru_mcu.cfg, wm_zru_hub.cfg, wm_zru_ext.cfg, wm_zru_load_cell.cfg, wm_zru_thr0.cfg à wm_zru_thr3.cfg (8 fichiers) | Identifiants CAN des huit cartes. À préserver comme identité matérielle, pas comme personnalisation fonctionnelle. |
| timelapse.cfg | Macros timelapse version indiquée 1.15, incluses ; prise de vue et parking désactivés par défaut dans les variables. Configuration possible par le service externe. |
| fluidd.cfg | Macros client génériques pause/reprise et pause par couche. **Aucun include vers ce fichier dans la chaîne fournie** : ses macros ne doivent pas être confondues avec celles réellement incluses de macros.cfg. |
| moonraker.conf | API sur port 7125, autorisations réseau local/CORS, historique, compatibilité OctoPrint, timelapse et storage_monitor. |
| crowsnest.conf | Caméra via ustreamer, 1280×720, 30 images/s demandées, HTTP 8080, RTSP désactivé, chemin matériel `/dev/v4l/by-id/...`. |
| tmt1.ini | Réglages de l’interface : model=2, 4 têtes, caméra/WLAN/filtre/ventilation activés, timelapse=0, language=3, luminosité 100 %, écran sans extinction automatique. Codes de couleurs/matériaux/buses conservés sans interprétation non documentée. |
| .prettierrc | Formatage de texte : indentation de 2 espaces ; pas de réglage d’impression. |

### Identifiants des cartes

Les huit identifiants CAN propres à l’imprimante ont été relevés pour la comparaison, mais ne sont pas publiés dans ce dépôt.

## Comportements actuels utiles pour la comparaison

START_PRINT attend BED, EXTRUDER et INITIAL_TOOL, prépare T0 à 140 °C, référence les axes, attend le plateau puis choisit un maillage selon les paramètres fournis et l’activation de la macro. Il sauvegarde sans redémarrage, sélectionne l’outil initial, chauffe et trace une ligne d’amorçage. G30/G31 activent/désactivent le recalcul via la variable de macro ; la variable persistante `adaptive_mesh_enable = 0` n’est pas lue par cette logique dans les fichiers fournis.

PAUSE mémorise les consignes des têtes, la température mesurée du plateau et les ventilateurs, parque par défaut à X150/Y1 avec une levée Z de 10, puis éteint les têtes. RESUME réchauffe, restaure la correspondance, essuie et revient au point mémorisé. Le plateau mémorisé est sa température mesurée et non sa consigne. Le timeout de 600 s annonce « all heaters off », mais son code n’éteint explicitement que les têtes via M104 ; ne pas interpréter ce message comme une extinction certaine du plateau et de la chambre.

M106 commande la ventilation principale, P2 l’auxiliaire, P3 l’extraction si elle existe. M107 éteint ces trois voies. M141/M191 règlent/attendent la chambre. PRINT_END et CANCEL_PRINT utilisent TURN_OFF_HEATERS, coupent la ventilation, effacent le maillage actif et réinitialisent plusieurs états.

Limites déclarées : vitesse 600 mm/s, accélération 5000 mm/s², Z 30 mm/s et 500 mm/s² ; plages X [-15,312], Y [-3,350], Z [-5,305]. Les coordonnées de docking expliquent que ces plages ne soient pas identiques à la seule zone imprimable. Températures maximales configurées : têtes 320 °C, plateau 120 °C, chambre 70 °C. Ces valeurs sont un relevé, pas une validation de compatibilité matérielle.

## Points de vigilance trouvés dans le code existant

Ces observations ne sont pas des changements demandés. Elles seront utiles pour voir si 1.1.12 les corrige. Elles résultent de la lecture statique ; le comportement exact dépend aussi du Klipper modifié du constructeur et des commandes envoyées par l’interface/trancheur.

1. **Pressure advance 0,032 / 0,04** : différence certaine entre la valeur configurée et celle imposée lors de la sélection de tête.
2. **Macros définies dans deux fichiers inclus** : SAVE_T_POSITON, _SAVE_TOOL_POSITION, CALIBRATE_TOOL_POSITION, _OFFSET_SET et _OFFSET_RESET apparaissent dans offset_calibrate.cfg puis change_macros.cfg. Il faut comparer les deux définitions et l’ordre des inclusions ; le moteur de configuration exact n’est pas fourni.
3. **Variables non définies localement** : `_CHANGING_TOOL` teste `printer_state` et `save_position` sans les définir dans cette macro. `save_position` est déclaré dans `_CHANGE_TOOL`, mais ce n’est pas une lecture explicite de cette autre macro. `_OFFSET_SET` et `_OFFSET_RESET` dans change_macros.cfg utilisent aussi `retry` sans définition locale. La sauvegarde/restauration XY prévue mérite donc vérification.
4. **Restauration de vitesse apparemment inversée** : dans `_RESTORE_SPEED`, la branche où les deux limites diffèrent écrit `VELOCITY={accel} ACCEL={velocity}`. Aucun appel à _SAVE_SPEED ou _RESTORE_SPEED n’a été trouvé dans les autres macros fournies ; impact effectif non établi.
5. **Sauvegarde de la correspondance à la pause** : RESUME lit `box_modify_t*_backup`, mais aucune écriture de ces backups par les macros fournies n’est trouvée. Elle peut être réalisée par l’interface ou une extension absente ; on ne peut pas garantir depuis cette archive seule qu’elle est toujours à jour.
6. **Branche ADAPTIVE** : START_PRINT compare `params.ADAPTIVE == 1` sans conversion, alors que d’autres paramètres sont explicitement convertis. C’est un point à vérifier dans l’environnement constructeur ; la branche utilisant MESH_MIN/MAX et PROBE_COUNT est distincte.
7. **Tests inclus mais incohérents par endroits** : TEST_POWER référence une sortie `QQQ` non définie dans l’archive ; certains tests utilisent `extruder0` alors que le nom configuré est `extruder`. Plusieurs compteurs `test_*_counter` ne figurent pas dans saved_variables.cfg. Ces tests ne constituent pas des procédures de validation prêtes à lancer.
8. **Rétraction arrondie** : E_axis_move convertit L en entier ; PAUSE/RESUME utilisent un défaut 2,5 mm, avec des conversions en entier dans le chemin. Le mouvement peut donc être de 2 mm plutôt que 2,5 mm.

## Comparaison à effectuer avec la sauvegarde 1.1.12

Le dossier après mise à jour permettra de produire : la liste des fichiers identiques/ajoutés/supprimés/modifiés, les différences ligne par ligne, puis une synthèse par fonction. Les seules modifications d’espaces/commentaires seront séparées des réglages et des comportements.

Priorité : examiner M104/M109, _WAIT_TOOL_TEMPERATURE, PAUSE/RESUME, les erreurs de changement de tête et le pressure advance ; puis les distances d’extrusion, offsets, docks, PID, input shaper, sonde, maillages et identifiants CAN. Enfin vérifier caméra, interface, timelapse et fichiers nouvellement inclus.

Les calibrations nouvelles ne seront pas assimilées automatiquement à des pertes : certaines peuvent avoir été recalculées. Les états transitoires ne seront pas proposés comme réglages à restaurer. Une éventuelle réintégration portera sur les blocs utiles après examen de leur équivalent 1.1.12, plutôt que sur le remplacement global des fichiers de la nouvelle version. L’archive actuelle suffit à retrouver le texte exact de toute ancienne macro présente.


## Inventaire vérifié des 29 fichiers

| Fichier | Octets | Lignes |
|---|---:|---:|
| config/.prettierrc | 40 | 4 |
| config/change_extruder.cfg | 1306 | 58 |
| config/change_macros.cfg | 25970 | 714 |
| config/crowsnest.conf | 2492 | 42 |
| config/extruder0.cfg | 1724 | 63 |
| config/extruder1.cfg | 1727 | 62 |
| config/extruder2.cfg | 1733 | 64 |
| config/extruder3.cfg | 1727 | 62 |
| config/fluidd.cfg | 15743 | 293 |
| config/fz-wipe-nozzle.cfg | 2533 | 90 |
| config/hub.cfg | 332 | 18 |
| config/load_cell.cfg | 960 | 53 |
| config/macros.cfg | 25404 | 737 |
| config/moonraker.conf | 590 | 35 |
| config/offset_calibrate.cfg | 14603 | 399 |
| config/printer.cfg | 12456 | 525 |
| config/saved_variables.cfg | 2176 | 79 |
| config/test_macro.cfg | 5649 | 207 |
| config/timelapse.cfg | 22482 | 427 |
| config/tmt1.ini | 356 | 35 |
| config/wm_zru_ext.cfg | 37 | 2 |
| config/wm_zru_hub.cfg | 36 | 2 |
| config/wm_zru_load_cell.cfg | 37 | 2 |
| config/wm_zru_mcu.cfg | 32 | 2 |
| config/wm_zru_thr0.cfg | 35 | 2 |
| config/wm_zru_thr1.cfg | 35 | 2 |
| config/wm_zru_thr2.cfg | 35 | 2 |
| config/wm_zru_thr3.cfg | 35 | 2 |
| config/zru-s.cfg | 837 | 59 |

## Index des sections et macros

Les numéros renvoient aux fichiers originaux et au contenu intégral numéroté. Les définitions multiples sont volontairement conservées.


### config/.prettierrc


### config/change_extruder.cfg

- Ligne 1 : `include wm_zru_ext.cfg`
- Ligne 5 : `custom_hall`
- Ligne 14 : `duplicate_pin_override`
- Ligne 17 : `filament_switch_sensor sensor_b`
- Ligne 21 : `filament_switch_sensor sensor_a`
- Ligne 26 : `echelon_stepper trans_stepper`
- Ligne 37 : `tmc2209 echelon_stepper trans_stepper`
- Ligne 45 : `stall_sensor ET_STALL_SENSOR`
- Ligne 48 : `lis2dw`
- Ligne 55 : `resonance_tester`

### config/change_macros.cfg

- Ligne 1 : `gcode_macro UNLOCK`
- Ligne 7 : `gcode_macro _UNLOCK_TOOL`
- Ligne 59 : `gcode_macro _CHECK_AND_UNLOCK`
- Ligne 78 : `gcode_macro UNLOCK_TOOL_FINISH`
- Ligne 97 : `gcode_macro LOCK`
- Ligne 109 : `gcode_macro _LOCK_CHECK`
- Ligne 122 : `gcode_macro _LOCK_TOOL`
- Ligne 168 : `gcode_macro _CHECK_AND_LOCK`
- Ligne 183 : `gcode_macro _LOCK_TOOL_FINISH`
- Ligne 202 : `gcode_macro _CHECK_T_SEQUENCE`
- Ligne 222 : `gcode_macro T0`
- Ligne 228 : `gcode_macro T1`
- Ligne 233 : `gcode_macro T2`
- Ligne 238 : `gcode_macro T3`
- Ligne 245 : `gcode_macro _CHANGE_TOOL`
- Ligne 281 : `gcode_macro _CHECK_CHANGE_TOOL_AGAIN`
- Ligne 293 : `gcode_macro _CHANGING_TOOL`
- Ligne 345 : `gcode_macro _CHECK_CHANGE_TOOL`
- Ligne 410 : `gcode_macro _raise_z`
- Ligne 435 : `gcode_macro _descend_z`
- Ligne 448 : `gcode_macro _check_tool_exist`
- Ligne 465 : `gcode_macro _check_hall_sensor`
- Ligne 478 : `gcode_macro _check_current_extruder_value`
- Ligne 505 : `gcode_macro _WAIT_TOOL_TEMPERATURE`
- Ligne 520 : `gcode_macro _SAVE_SPEED`
- Ligne 544 : `gcode_macro _RESTORE_SPEED`
- Ligne 566 : `gcode_macro GET_TOOL_POSITION`
- Ligne 572 : `gcode_macro TEST_ROUND`
- Ligne 584 : `gcode_macro SAVE_T_POSITON`
- Ligne 639 : `gcode_macro _SAVE_TOOL_POSITION`
- Ligne 653 : `gcode_macro CALIBRATE_TOOL_POSITION`
- Ligne 659 : `gcode_macro _ENABLE_SENSOR`
- Ligne 670 : `gcode_macro PARK_CURRENT_TOOL`
- Ligne 679 : `gcode_macro PARK_CURRENT_TOOL_RETRY`
- Ligne 689 : `gcode_macro _OFFSET_SET`
- Ligne 709 : `gcode_macro _OFFSET_RESET`

### config/crowsnest.conf

- Ligne 26 : `crowsnest`
- Ligne 32 : `cam 1`

### config/extruder0.cfg

- Ligne 1 : `include wm_zru_thr0.cfg`
- Ligne 4 : `tmc2209 extruder`
- Ligne 11 : `verify_heater extruder`
- Ligne 17 : `heater_fan hotend0_fan`
- Ligne 22 : `filament_switch_sensor filament0`
- Ligne 49 : `delayed_gcode delayed_pause0`
- Ligne 54 : `filament_switch_sensor docked0`
- Ligne 60 : `neopixel T0_RGB`

### config/extruder1.cfg

- Ligne 1 : `include wm_zru_thr1.cfg`
- Ligne 4 : `tmc2209 extruder1`
- Ligne 11 : `verify_heater extruder1`
- Ligne 17 : `heater_fan hotend1_fan`
- Ligne 22 : `filament_switch_sensor filament1`
- Ligne 49 : `delayed_gcode delayed_pause1`
- Ligne 54 : `filament_switch_sensor docked1`
- Ligne 60 : `neopixel T1_RGB`

### config/extruder2.cfg

- Ligne 1 : `include wm_zru_thr2.cfg`
- Ligne 5 : `tmc2209 extruder2`
- Ligne 12 : `verify_heater extruder2`
- Ligne 18 : `heater_fan hotend2_fan`
- Ligne 23 : `filament_switch_sensor filament2`
- Ligne 50 : `delayed_gcode delayed_pause2`
- Ligne 56 : `filament_switch_sensor docked2`
- Ligne 62 : `neopixel T2_RGB`

### config/extruder3.cfg

- Ligne 1 : `include wm_zru_thr3.cfg`
- Ligne 4 : `tmc2209 extruder3`
- Ligne 11 : `verify_heater extruder3`
- Ligne 17 : `heater_fan hotend3_fan`
- Ligne 22 : `filament_switch_sensor filament3`
- Ligne 49 : `delayed_gcode delayed_pause3`
- Ligne 54 : `filament_switch_sensor docked3`
- Ligne 60 : `neopixel T3_RGB`

### config/fluidd.cfg

- Ligne 50 : `virtual_sdcard`
- Ligne 54 : `pause_resume`
- Ligne 59 : `display_status`
- Ligne 61 : `respond`
- Ligne 63 : `gcode_macro CANCEL_PRINT`
- Ligne 93 : `gcode_macro PAUSE`
- Ligne 114 : `gcode_macro RESUME`
- Ligne 176 : `gcode_macro SET_PAUSE_NEXT_LAYER`
- Ligne 185 : `gcode_macro SET_PAUSE_AT_LAYER`
- Ligne 196 : `gcode_macro SET_PRINT_STATS_INFO`
- Ligne 214 : `gcode_macro _TOOLHEAD_PARK_PAUSE_CANCEL`
- Ligne 256 : `gcode_macro _CLIENT_EXTRUDE`
- Ligne 286 : `gcode_macro _CLIENT_RETRACT`

### config/fz-wipe-nozzle.cfg

- Ligne 2 : `gcode_macro WIPE_NOZZLE_SIMPLE`
- Ligne 58 : `gcode_macro WIPE_NOZZLE`
- Ligne 77 : `gcode_macro _SAVE_WIPE_POSITION`
- Ligne 87 : `gcode_macro CALIBRATE_WIPE_POSITION`

### config/hub.cfg

- Ligne 1 : `include wm_zru_hub.cfg`
- Ligne 4 : `filament_switch_sensor path_0`
- Ligne 8 : `filament_switch_sensor path_1`
- Ligne 12 : `filament_switch_sensor path_2`
- Ligne 16 : `filament_switch_sensor path_3`

### config/load_cell.cfg

- Ligne 1 : `include wm_zru_load_cell.cfg`
- Ligne 4 : `probe_air`
- Ligne 24 : `output_pin LEVELING`
- Ligne 29 : `output_pin GANTRY`
- Ligne 34 : `gcode_macro _GANTRY_TRIGGER`
- Ligne 40 : `gcode_macro _LEVELING_TRIGGER`
- Ligne 47 : `gcode_macro _LEVELING_TRIGGER_S`

### config/macros.cfg

- Ligne 1 : `delayed_gcode PRINTER_INIT`
- Ligne 7 : `gcode_macro START_PRINT`
- Ligne 91 : `gcode_macro PRINT_END`
- Ligne 130 : `gcode_macro E_axis_move`
- Ligne 145 : `gcode_macro PAUSE`
- Ligne 219 : `gcode_macro RESUME`
- Ligne 292 : `gcode_macro CANCEL_PRINT`
- Ligne 347 : `gcode_macro PROBE_CALIBRATE`
- Ligne 361 : `gcode_macro G29`
- Ligne 397 : `gcode_macro G30`
- Ligne 401 : `gcode_macro G31`
- Ligne 406 : `gcode_macro BED_MESH_CALIBRATE`
- Ligne 428 : `gcode_macro _START_PROBE`
- Ligne 451 : `gcode_macro M109`
- Ligne 480 : `gcode_macro M104`
- Ligne 508 : `gcode_macro M190`
- Ligne 519 : `gcode_macro M106`
- Ligne 534 : `gcode_macro M107`
- Ligne 541 : `gcode_macro M141`
- Ligne 547 : `gcode_macro M191`
- Ligne 563 : `gcode_macro _RGB_CLOSE`
- Ligne 579 : `gcode_macro _RGB_LOAD`
- Ligne 594 : `gcode_macro _RGB_UNLOAD`
- Ligne 609 : `gcode_macro _RGB_CURRENT`
- Ligne 624 : `gcode_macro EXTRUDE_FILAMENT`
- Ligne 650 : `gcode_macro RETRACT_FILAMENT`
- Ligne 665 : `gcode_macro LOAD_FILAMENT`
- Ligne 684 : `gcode_macro UNLOAD_FILAMENT`
- Ligne 705 : `gcode_macro M221`
- Ligne 713 : `gcode_macro RESET_FLOW_EXTRUDER`
- Ligne 721 : `gcode_macro filament_insert_gcode`
- Ligne 732 : `gcode_macro filament_insert`

### config/moonraker.conf

- Ligne 1 : `server`
- Ligne 6 : `authorization`
- Ligne 23 : `octoprint_compat`
- Ligne 25 : `history`
- Ligne 27 : `timelapse`
- Ligne 35 : `storage_monitor`

### config/offset_calibrate.cfg

- Ligne 1 : `tools_calibrate`
- Ligne 24 : `gcode_macro RESPOND_T_OFFSET`
- Ligne 35 : `gcode_macro SAVE_T_OFFSET`
- Ligne 76 : `gcode_macro RESPOND_T_POSITION`
- Ligne 87 : `gcode_macro SAVE_T_POSITON`
- Ligne 116 : `gcode_macro _OFFSET_SET`
- Ligne 135 : `gcode_macro _OFFSET_RESET`
- Ligne 140 : `gcode_macro _CALIBRATE_MOVE_OVER_PROBE`
- Ligne 151 : `gcode_macro TEST_W4`
- Ligne 158 : `gcode_macro _APPLY_PRE_Z_OFFSET`
- Ligne 175 : `gcode_macro NOZZLE_PREPARE`
- Ligne 215 : `gcode_macro NOZZLE_CALIBRATE_TOOL_OFFSET`
- Ligne 237 : `gcode_macro RAPID_MODE`
- Ligne 255 : `gcode_macro CALIBRATE_TOOL_OFFSET`
- Ligne 286 : `gcode_macro CALIBRATE_OFFSET_ALL_RAPID_MODE`
- Ligne 295 : `gcode_macro CALIBRATE_OFFSET_ALL_FINE_MODE`
- Ligne 304 : `gcode_macro CALIBRATE_TOOL_Z_OFFSET`
- Ligne 324 : `gcode_macro _SAVE_PROBE_POS`
- Ligne 336 : `gcode_macro _SAVE_TOOL_POSITION`
- Ligne 351 : `gcode_macro CALIBRATE_TOOL_POSITION`
- Ligne 360 : `gcode_macro SAVE_TOOL_OFFSET`
- Ligne 374 : `gcode_macro POP`

### config/printer.cfg

- Ligne 4 : `include timelapse.cfg`
- Ligne 5 : `include macros.cfg`
- Ligne 6 : `include wm_zru_mcu.cfg`
- Ligne 7 : `include hub.cfg`
- Ligne 8 : `include change_extruder.cfg`
- Ligne 9 : `include extruder0.cfg`
- Ligne 10 : `include extruder1.cfg`
- Ligne 11 : `include extruder2.cfg`
- Ligne 12 : `include extruder3.cfg`
- Ligne 13 : `include load_cell.cfg`
- Ligne 14 : `include offset_calibrate.cfg`
- Ligne 15 : `include change_macros.cfg`
- Ligne 16 : `include fz-wipe-nozzle.cfg`
- Ligne 17 : `include test_macro.cfg`
- Ligne 18 : `include zru-s.cfg`
- Ligne 21 : `probe`
- Ligne 40 : `save_variables`
- Ligne 44 : `stepper_x`
- Ligne 62 : `stepper_y`
- Ligne 80 : `stepper_z`
- Ligne 99 : `extruder`
- Ligne 131 : `extruder1`
- Ligne 164 : `extruder2`
- Ligne 196 : `extruder3`
- Ligne 230 : `tmc2209 stepper_x`
- Ligne 236 : `tmc2209 stepper_y`
- Ligne 242 : `tmc2209 stepper_z`
- Ligne 250 : `stall_sensor Z_STALL_SENSOR`
- Ligne 253 : `heater_bed`
- Ligne 268 : `verify_heater heater_bed`
- Ligne 275 : `fan`
- Ligne 283 : `fan_generic auxiliary_fan`
- Ligne 290 : `controller_fan motherboard_fan`
- Ligne 298 : `gcode_macro z_rise`
- Ligne 311 : `homing_override`
- Ligne 356 : `gcode_macro Z_HOMING`
- Ligne 385 : `screws_tilt_adjust`
- Ligne 399 : `bed_mesh`
- Ligne 411 : `input_shaper`
- Ligne 413 : `respond`
- Ligne 417 : `printer`
- Ligne 426 : `virtual_sdcard`
- Ligne 429 : `pause_resume`
- Ligne 432 : `idle_timeout`
- Ligne 442 : `force_move`
- Ligne 445 : `display_status`
- Ligne 447 : `gcode_arcs`
- Ligne 450 : `exclude_object`

### config/saved_variables.cfg

- Ligne 1 : `Variables`

### config/test_macro.cfg

- Ligne 1 : `gcode_macro WIPE_NOZZ`
- Ligne 16 : `gcode_macro TEST_POWER`
- Ligne 44 : `gcode_macro TEST_XY`
- Ligne 65 : `gcode_macro TEST_WIPE`
- Ligne 88 : `gcode_macro TEST_NOZZLE`
- Ligne 110 : `gcode_macro TEST_BED`
- Ligne 127 : `gcode_macro TEST_BED_LEV`
- Ligne 143 : `gcode_macro TEST_change_tool`
- Ligne 174 : `gcode_macro TEST_PROBE`
- Ligne 192 : `gcode_macro TEST_FAN`

### config/timelapse.cfg

- Ligne 19 : `gcode_macro GET_TIMELAPSE_SETUP`
- Ligne 49 : `gcode_macro _SET_TIMELAPSE_SETUP`
- Ligne 232 : `gcode_macro TIMELAPSE_TAKE_FRAME`
- Ligne 297 : `gcode_macro _TIMELAPSE_NEW_FRAME`
- Ligne 304 : `delayed_gcode _WAIT_TIMELAPSE_TAKE_FRAME`
- Ligne 344 : `gcode_macro HYPERLAPSE`
- Ligne 367 : `delayed_gcode _HYPERLAPSE_LOOP`
- Ligne 382 : `gcode_macro TIMELAPSE_RENDER`
- Ligne 393 : `delayed_gcode _WAIT_TIMELAPSE_RENDER`
- Ligne 412 : `gcode_macro TEST_STREAM_DELAY`

### config/tmt1.ini

- Ligne 1 : `printer`
- Ligne 5 : `system`
- Ligne 14 : `screen`
- Ligne 20 : `slot`
- Ligne 30 : `nozzle`

### config/wm_zru_ext.cfg

- Ligne 1 : `mcu EX_T`

### config/wm_zru_hub.cfg

- Ligne 1 : `mcu HUB`

### config/wm_zru_load_cell.cfg

- Ligne 1 : `mcu CELL`

### config/wm_zru_mcu.cfg

- Ligne 1 : `mcu`

### config/wm_zru_thr0.cfg

- Ligne 1 : `mcu T0`

### config/wm_zru_thr1.cfg

- Ligne 1 : `mcu T1`

### config/wm_zru_thr2.cfg

- Ligne 1 : `mcu T2`

### config/wm_zru_thr3.cfg

- Ligne 1 : `mcu T3`

### config/zru-s.cfg

- Ligne 1 : `heater_generic chamber`
- Ligne 15 : `verify_heater chamber`
- Ligne 21 : `controller_fan chamber_fan1`
- Ligne 33 : `controller_fan chamber_fan2`
- Ligne 45 : `fan_generic air_fan`

## Intégrité de la référence

SHA-256 de l’archive : `1faa0903d21f69aa8feea7d5475c7f9af9c1a3134405706e657739a810273e38`.

Les empreintes individuelles sont conservées dans `inventaire_1.1.08.json`.
