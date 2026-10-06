from html import escape
from pathlib import Path

root = Path(__file__).resolve().parents[1]

translations = {
    'fr': {
        'title': 'Imprimer avec les couleurs',
        'heads': 'Couleurs chargées dans l’imprimante',
        'refresh': 'Actualiser',
        'empty': 'Vide', 'black': 'Noir', 'ochre': 'Ocre', 'white': 'Blanc',
        'file': '1. Choisir le fichier', 'search': 'Rechercher un fichier',
        'time': 'Durée estimée', 'filament': 'Filament', 'size': 'Taille du fichier', 'height': 'Hauteur',
        'mapping': '2. Couleurs du fichier → têtes (2)', 'color1': 'Couleur 1', 'color2': 'Couleur 2',
        'close': 'Fermer', 'print': 'Confirmer et imprimer',
        'note1': ['Vérifier les couleurs', 'sur l’imprimante'],
        'note2': ['Choisir un G-code', 'déjà envoyé à Fluidd'],
        'note3': ['Associer chaque couleur', 'à une tête chargée'],
        'note4': ['Vérifier et lancer', 'l’impression'],
    },
    'en': {
        'title': 'Print with colors',
        'heads': 'Colors loaded in the printer',
        'refresh': 'Refresh',
        'empty': 'Empty', 'black': 'Black', 'ochre': 'Ochre', 'white': 'White',
        'file': '1. Choose the file', 'search': 'Search files',
        'time': 'Estimated time', 'filament': 'Filament', 'size': 'File size', 'height': 'Height',
        'mapping': '2. File colors → toolheads (2)', 'color1': 'Color 1', 'color2': 'Color 2',
        'close': 'Close', 'print': 'Confirm and print',
        'note1': ['Check colors loaded', 'in the printer'],
        'note2': ['Choose a G-code', 'already uploaded'],
        'note3': ['Map each model color', 'to a loaded toolhead'],
        'note4': ['Check and start', 'the print'],
    },
}


def label(x, y, value, size=14, color='#f3f5f7', weight=400, extra=''):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{weight}" {extra}>{escape(value)}</text>'


def callout(number, x, y, lines, side):
    line_y = y + 50
    connector = f'<path d="M {x + (212 if side == "left" else 0)} {line_y} L {274 if side == "left" else 870} {line_y}" stroke="#688398" stroke-width="2"/>'
    text = ''.join(label(x + 51, y + 31 + i * 23, part, 16, '#26313d', 600) for i, part in enumerate(lines))
    return (connector + f'<rect x="{x}" y="{y}" width="212" height="96" rx="12" fill="#fff" stroke="#cad5de"/>'
            + f'<circle cx="{x + 25}" cy="{y + 26}" r="17" fill="#176eaa"/>'
            + label(x + 25, y + 32, str(number), 18, '#fff', 700, 'text-anchor="middle"') + text)


def build(locale, t):
    p = ['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="800" viewBox="0 0 1120 800" role="img" aria-labelledby="title desc">',
         f'<title id="title">{escape(t["title"])}</title>',
         '<desc id="desc">Bookmark dialog with printer colors, G-code preview, color mapping, and print confirmation.</desc>',
         '<rect width="1120" height="800" fill="#edf2f6"/>',
         '<rect x="250" y="22" width="620" height="758" rx="15" fill="#25262a" stroke="#4c525a" stroke-width="2"/>',
         label(274, 63, t['title'], 23, weight=700),
         '<rect x="274" y="82" width="572" height="116" rx="7" fill="#25262a" stroke="#565d66"/>',
         label(288, 109, t['heads'], 15, weight=700),
         '<rect x="750" y="92" width="84" height="28" rx="5" fill="#555a62"/>',
         label(792, 111, t['refresh'], 12, extra='text-anchor="middle"'),
         label(274, 231, t['file'], 16, weight=700),
         '<rect x="274" y="244" width="572" height="38" rx="5" fill="#35363a" stroke="#666"/>',
         label(287, 269, t['search'], 14, '#abb4be'),
         '<rect x="274" y="290" width="572" height="38" rx="5" fill="#35363a" stroke="#666"/>',
         label(287, 315, 'example.gcode', 14),
         label(829, 315, '⌄', 16),
         '<rect x="274" y="337" width="572" height="108" rx="7" fill="#303136"/>',
         '<rect x="284" y="346" width="90" height="90" rx="5" fill="#202125"/>',
         '<path d="M 310 414 Q 295 390 319 367 Q 343 356 354 386 Q 362 418 337 424 Z" fill="#8c979f"/>',
         label(274, 480, t['mapping'], 16, weight=700),
         '<rect x="274" y="494" width="572" height="66" rx="7" fill="#303136"/>',
         '<rect x="274" y="570" width="572" height="66" rx="7" fill="#303136"/>',
         '<rect x="588" y="665" width="85" height="40" rx="6" fill="#555a62"/>',
         '<rect x="682" y="665" width="164" height="40" rx="6" fill="#25a900"/>',
         label(630, 691, t['close'], 14, extra='text-anchor="middle"'),
         label(764, 691, t['print'], 13, '#fff', 700, 'text-anchor="middle"'),
         label(846, 744, "by Imprim'ER", 11, '#92969e', extra='text-anchor="end"')]
    for i, (name, fill) in enumerate([(t['empty'], 'none'), (t['black'], '#000'), (t['ochre'], '#c99542'), (t['white'], '#fff')]):
        x = 288 + i * 137
        p.append(f'<rect x="{x}" y="135" width="130" height="43" rx="5" fill="#303136"/>')
        p.append(f'<circle cx="{x + 18}" cy="156" r="10" fill="{fill}" stroke="#aab1b7" {"stroke-dasharray=\"2 2\"" if i == 0 else ""}/>')
        p.append(label(x + 34, 161, f'T{i} · {name}', 12))
    for x, y, heading, value in [(392, 368, t['time'], '1 h 17 min'), (582, 368, t['filament'], '12,2 g' if locale == 'fr' else '12.2 g'),
                                  (392, 410, t['size'], '5,4 Mo' if locale == 'fr' else '5.4 MB'), (582, 410, t['height'], '30 mm')]:
        p.extend([label(x, y, heading, 12, '#bbb'), label(x, y + 18, value, 14, weight=700)])
    for x, y, fill in [(796, 367, '#000'), (825, 367, '#fff')]:
        p.append(f'<circle cx="{x}" cy="{y}" r="12" fill="{fill}" stroke="#aaa"/>')
    for y, color, name, head in [(527, '#000', t['color1'], f'T1 · {t["black"]}'), (603, '#fff', t['color2'], f'T3 · {t["white"]}')]:
        p.extend([f'<circle cx="298" cy="{y}" r="16" fill="{color}" stroke="#aaa"/>', label(326, y + 5, name, 15, weight=700),
                  label(542, y + 6, '→', 21, '#b8c2c9'), f'<rect x="572" y="{y - 20}" width="262" height="40" rx="5" fill="#35363a" stroke="#666"/>',
                  f'<circle cx="591" cy="{y}" r="10" fill="{color}" stroke="#aaa"/>', label(610, y + 5, head, 14)])
    p.extend([callout(1, 18, 104, t['note1'], 'left'), callout(2, 890, 272, t['note2'], 'right'),
              callout(3, 18, 498, t['note3'], 'left'), callout(4, 890, 648, t['note4'], 'right'), '</svg>'])
    (root / 'docs' / f'guide-favori-{locale}.svg').write_text('\n'.join(p) + '\n', encoding='utf-8')


for language, strings in translations.items():
    build(language, strings)
