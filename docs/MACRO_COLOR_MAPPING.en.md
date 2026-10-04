# Klipper `ORCA_COLOR_SETUP` macro

English · [Français](MACRO_COLOR_MAPPING.md) · [Home](../README.en.md)

[`klipper/color_mapping_fluidd.cfg`](../klipper/color_mapping_fluidd.cfg) is **a macro created for this project**. It adds an interactive toolhead selection prompt in Fluidd at the start of a G-code file prepared to call it. It is not part of the original WonderMaker configuration.

This is a separate path from the bookmark. **The current bookmark does not call it**: the bookmark saves the mapping directly before starting the original G-code. Both paths use the same `box_modify_t0`–`box_modify_t3` variables, which the printer’s `T0`–`T3` macros read when changing toolheads.

## What the macro does

1. The G-code calls `ORCA_COLOR_SETUP` with the tools used and their colors.
2. The macro displays a Fluidd prompt for each color and pauses the print with `M25`.
3. The user chooses a physical toolhead T0–T3 for each color. Reusing one toolhead for several colors triggers a warning.
4. A summary shows the choices. **Confirm and print** writes `box_modify_tN` and `box_modify_tN_backup`, then `M24` resumes the G-code.
5. When a `T0`–`T3` command occurs later in the G-code, the corresponding WonderMaker macro reads `box_modify_tN` and calls `_CHANGE_TOOL` with the chosen physical toolhead.

For example, mapping file color `T0` to physical toolhead `T2` sets `box_modify_t0` to `2`. The G-code’s `T0` command then triggers `_CHANGE_TOOL T=2`.

## Install on the printer

Installation is needed only for the **Fluidd prompt path**. It changes Klipper configuration; do it while the printer is idle.

1. Back up the printer’s `printer.cfg` and saved variables file.
2. In Fluidd’s configuration editor, put [`color_mapping_fluidd.cfg`](../klipper/color_mapping_fluidd.cfg) in the same configuration directory as `printer.cfg`.
3. Add `[include color_mapping_fluidd.cfg]` to `printer.cfg` after the WonderMaker configuration includes. Do not duplicate the line if it is already present.
4. Save and restart Klipper from Fluidd. Check for configuration errors.

The macro assumes that the printer configuration already provides `[save_variables]`, `[respond]`, `[virtual_sdcard]`, the `T0`–`T3` macros, and `_CHANGE_TOOL` reading `box_modify_tN`. Check these in your own printer configuration; the manufacturer's files are not distributed in this repository.

## Call it from G-code

The call must appear **before the first tool-dependent command** (`T0`–`T3` or targeted toolhead heating). The bookmark does not add this call; this path requires a separately prepared G-code file.

```gcode
ORCA_COLOR_SETUP USED=02 C0=000000 C2=FFFFFF
```

Here, only logical tools `T0` and `T2` are used. `USED` contains their digits in ascending order without commas; each used `C0`–`C3` gets six hexadecimal digits **without `#`**. These are the intended colors in the file, not physical toolhead numbers. Physical toolheads are chosen in the Fluidd prompt.

For another file, adapt `USED` and `C0`–`C3` to the tools and colors actually present in its G-code. Do not reuse the example unchanged for a different print.

## While using it

- If the prompt was hidden, `COULEURS_REOUVRIR` shows it again while a choice is pending.
- `COULEURS_ANNULER` cancels a print waiting for a mapping.
- `COLOR_MAPPING_STATUS` displays the saved mapping.
- **Recommencer** clears the current prompt selections and returns to the first color.

The prompt text supplied by this macro is currently in French. The browser bookmark has French and English interfaces.

## Validation status

The initial prepared-G-code and Klipper-macro path completed a print with identity mapping `T0→T0`, `T1→T1`, `T2→T2`, `T3→T3`. That alone does not validate a different mapping on this path. Tests with reassigned toolheads succeeded using **the bookmark**, which writes the same variables directly; they do not validate reassignment through this macro.

Klipper references: [configuration includes and modules](https://www.klipper3d.org/Config_Reference.html), [`M24` and `M25` commands](https://www.klipper3d.org/G-Codes.html).
