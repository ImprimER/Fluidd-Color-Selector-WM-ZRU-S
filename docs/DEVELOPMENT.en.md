# How it works and how to maintain it

English · [Français](DEVELOPPEMENT.md) · [User guide](../README.en.md)

## Scope

The bookmark is designed for the WonderMaker ZR Ultra S with Fluidd/Moonraker, the `box_modify_t0`–`box_modify_t3` variables, `tmt1.ini`, and the `filament0`–`filament3` sensors. It is not a universal Fluidd extension. It uses the currently open Fluidd address and checks for Moonraker.

The browser lists G-code files already on the printer, then reads the OrcaSlicer color and tool usage comments at the end of the chosen file. It does not create a modified G-code copy.

## Two paths to the same mapping

The WonderMaker configuration’s `T0`–`T3` macros read `box_modify_t0`–`box_modify_t3` and call `_CHANGE_TOOL` with the resulting physical number. This repository contains two ways to set those variables:

| Path | Mapping source | Start of G-code |
| --- | --- | --- |
| Browser bookmark | `SAVE_VARIABLE` sent through Moonraker before starting | Original G-code, without an `ORCA_COLOR_SETUP` call. |
| [`ORCA_COLOR_SETUP` macro](MACRO_COLOR_MAPPING.en.md) | Fluidd prompt, then `SAVE_VARIABLE` inside the macro | Prepared G-code calling `ORCA_COLOR_SETUP`, then an `M25` pause. |

The bookmark depends on the compatible WonderMaker configuration’s `T0`–`T3` macros, **not** on `ORCA_COLOR_SETUP`. Before sending `SAVE_VARIABLE`, it reads `configfile` through Moonraker and checks `[save_variables]`, `_CHANGE_TOOL`, and each `Tn` macro’s use of `box_modify_tN`. An incompatible printer is rejected before any print starts.

`klipper/color_mapping_fluidd.cfg` is a separate method created for this project. It does not replace the `T0`–`T3` macros and is not installed to follow the bookmark path.

## Color and filament presence

- Screen color codes come from `/server/files/config/tmt1.ini`. Palette indices follow the screen swatches row by row, starting at 0. The bookmark’s hex colors are approximate.
- Klipper objects `filament_switch_sensor filament0`–`filament3` report filament presence. A color code alone does not establish that a spool is loaded.
- The firmware may disable monitoring for inactive toolheads (`enabled=false`) and enable it when changing tools. The bookmark uses `filament_detected` for presence; a missing or unknown value still blocks printing.
- Sensors are checked again before starting a print. Printing is blocked when a selected toolhead is empty or a sensor state cannot be confirmed.
- The displayed color is the one declared on the printer screen. No sensor measures the physical spool color.

## Starting a print with the bookmark

After **Confirm and print**, the bookmark checks printer status and confirms that the selected file has not changed. It saves the mapping in `box_modify_tN` and `box_modify_tN_backup`, then starts the original G-code through Moonraker. If the start request fails, it checks printer status before attempting to restore previous values. It asks the user to inspect Fluidd when the start result is uncertain.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| The bookmark does not open | Open Fluidd, then launch the bookmark from the bookmarks bar. Check that its address begins with `javascript:`. |
| No files are listed | Upload a `.gcode` file to Fluidd; only files already on the printer are listed. |
| File colors are not recognized | Use OrcaSlicer G-code that retains color and filament usage comments. |
| A toolhead shows “Empty” | Check the filament and sensor on the printer, then click **Refresh**. |
| The displayed color differs from the spool | Correct the color declared on the printer screen and check the physical spool. |
| Printing is blocked | Read the dialog message; do not try again if Fluidd already shows an active print. |

## Current files

- [`src/favori_couleurs_fluidd.js`](../src/favori_couleurs_fluidd.js): bookmark source.
- [`klipper/color_mapping_fluidd.cfg`](../klipper/color_mapping_fluidd.cfg): the project’s interactive macro; [installation and operation](MACRO_COLOR_MAPPING.en.md).
- [`tools/build_favori.py`](../tools/build_favori.py): generates [the installer page](../dist/Installer_favori_couleurs_Fluidd.html).
- [`tools/check_favori.py`](../tools/check_favori.py), [`tests/test_bookmarklet.js`](../tests/test_bookmarklet.js), and [`tests/fixtures/`](../tests/fixtures/): offline checks.

To regenerate and verify from the repository root:

```powershell
python tools/build_favori.py
node --check src/favori_couleurs_fluidd.js
python tools/check_favori.py
node tests/test_bookmarklet.js
```

The bookmark uses Moonraker’s `/server/info`, `/server/files/list`, `/server/files/gcodes`, `/server/files/config/tmt1.ini`, `/printer/objects/query`, `/printer/gcode/script`, and `/printer/print/start` routes. The last two are called only after confirmation.

## Technical archives

The [firmware analyses](comparaison_1.1.08_1.1.12.md) document earlier experiments and comparisons. Copies of the manufacturer's macros and derived patches are not distributed in this public repository. Check your own printer configuration to verify its `T0`–`T3` mechanism.

Full firmware archives, print G-code files, private screenshots, and personal configurations are not tracked in Git.
