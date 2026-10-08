const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/favori_couleurs_fluidd.js', 'utf8');
const paletteBlock = source.match(/const palette=(\{[\s\S]*?\n  \});/);
assert.ok(paletteBlock, 'Toolhead palette missing');
const paletteFor = language => vm.runInNewContext(`(${paletteBlock[1]})`, { tr: (fr, en) => language === 'fr' ? fr : en });
const paletteNames = {
  fr: ['Blanc', 'Beige', 'Marron', 'Gris', 'Noir', 'Cyan', 'Bleu clair', 'Bleu foncé', 'Vert clair', 'Vert foncé', 'Jaune', 'Orange', 'Rose pâle', 'Magenta', 'Rouge', 'Bleu brillant', 'Or', 'Cuivre', 'Argent', 'Multicolore', 'Transparent'],
  en: ['White', 'Beige', 'Brown', 'Gray', 'Black', 'Cyan', 'Light blue', 'Dark blue', 'Light green', 'Dark green', 'Yellow', 'Orange', 'Light pink', 'Magenta', 'Red', 'Bright blue', 'Gold', 'Copper', 'Silver', 'Multicolor', 'Transparent'],
};
for (const language of ['fr', 'en']) {
  const palette = paletteFor(language);
  assert.deepEqual(Object.keys(palette), Array.from({ length: 21 }, (_, i) => String(i)), 'Palette must cover screen codes 0–20');
  assert.deepEqual(Array.from({ length: 21 }, (_, i) => palette[i].name), paletteNames[language], `Frozen ${language} palette names changed`);
}
assert.equal(paletteFor('fr')[2].hex, '#9A6738', 'Code 2 must be brown');
assert.equal(paletteFor('fr')[7].hex, '#0B4BD8', 'Code 7 must be a solid dark blue');
assert.match(paletteFor('fr')[15].css, /^radial-gradient\(/, 'Code 15 must retain the bright blue effect');
const tail = fs.readFileSync('tests/fixtures/orca_tail_4.txt', 'utf8');
const installer = fs.readFileSync('dist/Installer_favori_couleurs_Fluidd.html', 'utf8');
const installerScript = installer.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(installerScript, 'Installer copy fallback missing');
new vm.Script(installerScript[1]);
assert.match(installer, /<section lang="en" hidden>/);
assert.match(installer, /Firefox, Chrome, and Edge/);
assert.match(installer, /Keep the <code>javascript:<\/code> prefix/);
assert.match(installer, />🎨 Imprimer avec les couleurs<\/a>/);
assert.match(installer, />🎨 Print with colors<\/a>/);
assert.match(installer, /<p class="credit">by Imprim'ER<\/p>/);

class Element {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.style = {};
    this.value = '';
    this.disabled = false;
    this.hidden = false;
  }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  attachShadow() { this.shadow = new Element('shadow'); return this.shadow; }
  setAttribute() {}
  get options() { return this.children.filter(child => child.tag === 'option'); }
}

function descendants(element) {
  return [element, ...element.children.flatMap(descendants), ...(element.shadow ? descendants(element.shadow) : [])];
}

const json = result => ({ ok: true, status: 200, json: async () => ({ result }) });

async function scenario(language, sensors, mapping = true, hasThumbnail = true) {
  const root = new Element('root');
  const calls = [];
  const fetch = async (path, options = {}) => {
    calls.push({ path, method: options.method || 'GET' });
    if (path === '/server/info') return json({ moonraker_version: 'test' });
    if (path === '/server/files/list?root=gcodes') return json([{ path: 'sample.gcode', size: tail.length, modified: 1 }]);
    if (path === '/server/files/config/tmt1.ini') return { ok: true, text: async () => '[slot]\ncolor0=4\ncolor1=4\ncolor2=2\ncolor3=0\n' };
    if (path.startsWith('/printer/objects/query?filament_switch_sensor')) {
      const status = {};
      sensors.forEach((detected, i) => {
        if (detected !== null) status[`filament_switch_sensor filament${i}`] = { filament_detected: detected === 'disabled' ? true : detected, enabled: detected !== 'disabled' };
      });
      return json({ status });
    }
    if (path === '/server/files/gcodes/sample.gcode') return { ok: true, status: 200, text: async () => tail };
    if (path === '/server/files/metadata?filename=sample.gcode') return json({ size: 5415782, estimated_time: 4600, filament_weight_total: 12.17, object_height: 29.96,
      thumbnails: hasThumbnail ? [{ width: 32, height: 32, size: 900, relative_path: '.thumbs/small.png' }, { width: 93, height: 93, size: 4000, relative_path: '.thumbs/preview.png' }] : [] });
    if (path === '/printer/objects/query?configfile') {
      const config = { save_variables: { filename: 'variables.cfg' }, 'gcode_macro _CHANGE_TOOL': { gcode: 'M118 tool change' } };
      for (let i = 0; i < 4; i++) config[`gcode_macro T${i}`] = { gcode: `_CHANGE_TOOL T={{printer.save_variables.variables.box_modify_t${i}}}` };
      if (!mapping) config['gcode_macro T0'] = { gcode: '_CHANGE_TOOL T=0' };
      return json({ status: { configfile: { config } } });
    }
    if (path === '/printer/objects/query?print_stats&save_variables') return json({ status: { print_stats: { state: 'standby' }, save_variables: { variables: {} } } });
    if (path.startsWith('/printer/gcode/script') || path.startsWith('/printer/print/start')) return json({});
    throw new Error(`Unexpected request: ${path}`);
  };
  const context = {
    document: { documentElement: root, createElement: tag => new Element(tag), getElementById: () => null },
    location: { hostname: 'printer.local', protocol: 'http:' },
    navigator: { language }, fetch,
    Intl,
    alert: () => { throw new Error('Unexpected alert'); },
    confirm: () => true,
    setTimeout: () => {},
  };
  vm.runInNewContext(source, context);
  for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve));
  const all = descendants(root);
  const title = all.find(element => element.tag === 'h2');
  assert.equal(all.find(element => element.className === 'credit').textContent, "by Imprim'ER");
  const dialog = all.find(element => element.className === 'box');
  const headsBox = all.find(element => element.className === 'heads');
  const fileTitle = all.find(element => element.tag === 'h3');
  assert.ok(dialog.children.indexOf(headsBox) < dialog.children.indexOf(fileTitle), 'Printer colors must precede file selection');
  assert.equal(descendants(headsBox).find(element => element.className === 'heads-title').children[0].textContent,
    language.startsWith('fr') ? 'Couleurs chargées dans l’imprimante' : 'Colors loaded in the printer');
  const file = all.find(element => element.tag === 'select');
  assert.ok(file, 'File selector missing');
  file.value = 'sample.gcode';
  await file.onchange();
  const updated = descendants(root);
  const preview = updated.find(element => element.className === 'file-preview');
  const previewImage = preview.children.find(element => element.tag === 'img');
  assert.equal(preview.hidden, false, 'File details must remain visible without a thumbnail');
  assert.equal(previewImage.hidden, !hasThumbnail, 'Image visibility must follow thumbnail availability');
  if (hasThumbnail) assert.equal(previewImage.src, '/server/files/gcodes/.thumbs/preview.png', 'Choose the compact thumbnail');
  const stats = preview.children.find(element => element.className === 'preview-details');
  assert.equal(stats.children.length, 4, 'Show four compact file details');
  assert.deepEqual(stats.children.map(element => element.children[0].textContent), language.startsWith('fr')
    ? ['Durée estimée', 'Filament', 'Taille du fichier', 'Hauteur']
    : ['Estimated time', 'Filament', 'File size', 'Height']);
  assert.deepEqual(stats.children.map(element => element.children[1].textContent), language.startsWith('fr')
    ? ['1 h 17 min', '12,2 g', '5,4 Mo', '30 mm']
    : ['1 h 17 min', '12.2 g', '5.4 MB', '30 mm']);
  const previewColors = preview.children.find(element => element.className === 'preview-colors');
  assert.equal(previewColors.hidden, false, 'Model colors must appear next to the file details');
  assert.deepEqual(previewColors.children.map(element => element.style.backgroundColor), ['#FFFF71', '#008000', '#000000', '#FFFFFF']);
  const start = updated.find(element => element.tag === 'button' && element.className === 'primary');
  const toolSelectors = updated.filter(element => element.tag === 'select').slice(1);
  assert.ok(start, 'Print button missing');
  assert.ok(toolSelectors.length > 0, 'Toolhead selectors missing');
  return { root, calls, title, start, toolSelectors };
}

(async () => {
  assert.doesNotMatch(source, /192\.168\.\d{1,3}\.\d{1,3}/, 'Fixed printer IP remains');

  const empty = await scenario('en-US', [false, true, true, true]);
  assert.equal(empty.title.textContent, 'Print with colors');
  assert.equal(empty.toolSelectors[0].value, '', 'Toolhead choice must start empty');
  assert.equal(empty.toolSelectors[0].options.find(option => option.value === '0').disabled, true, 'Empty toolhead option must be disabled');
  empty.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  assert.equal(empty.start.disabled, true, 'Empty selected toolhead must disable print');
  await empty.start.onclick();
  assert.equal(empty.calls.filter(call => call.method === 'POST').length, 0, 'Empty toolhead must not trigger a POST');

  const loaded = await scenario('fr-FR', [true, true, true, true]);
  assert.equal(loaded.title.textContent, 'Imprimer avec les couleurs');
  loaded.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  assert.equal(loaded.start.disabled, false, 'Loaded toolheads should allow confirmation');
  const chosenSwatches = descendants(loaded.root).filter(element => element.className === 'swatch chosen-head-swatch');
  assert.equal(chosenSwatches.length, loaded.toolSelectors.length, 'Each toolhead choice needs a swatch');
  assert.deepEqual(chosenSwatches.map(element => element.style.background), ['#000000', '#000000', '#9A6738', '#FFFFFF']);
  loaded.toolSelectors[0].value = '3'; loaded.toolSelectors[0].onchange();
  assert.equal(chosenSwatches[0].style.background, '#FFFFFF', 'Selected swatch must follow the chosen toolhead');
  await loaded.start.onclick();
  assert.ok(loaded.calls.some(call => call.path === '/printer/objects/query?configfile'), 'Firmware mapping must be checked');
  assert.ok(loaded.calls.some(call => call.path.startsWith('/printer/print/start')), 'Compatible firmware should allow printing');

  const incompatible = await scenario('en-US', [true, true, true, true], false);
  incompatible.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  await incompatible.start.onclick();
  assert.equal(incompatible.calls.filter(call => call.method === 'POST').length, 0, 'Incompatible firmware must not receive a print command');

  const unavailable = await scenario('en-US', [null, true, true, true]);
  assert.equal(unavailable.toolSelectors[0].options.find(option => option.value === '1').disabled, false, 'One unavailable sensor must not hide other toolheads');
  unavailable.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  assert.equal(unavailable.start.disabled, true, 'Unknown sensor state must disable print');
  await unavailable.start.onclick();
  assert.equal(unavailable.calls.filter(call => call.method === 'POST').length, 0, 'Unknown sensor state must not trigger a POST');

  const disabled = await scenario('en-US', ['disabled', true, true, true]);
  disabled.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  assert.equal(disabled.start.disabled, false, 'A disabled runout monitor must not hide a detected filament');
  await disabled.start.onclick();
  assert.ok(disabled.calls.some(call => call.path.startsWith('/printer/print/start')), 'Detected filament remains usable when its monitor is disabled');

  const withoutThumbnail = await scenario('en-US', [true, true, true, true], true, false);
  withoutThumbnail.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  assert.equal(withoutThumbnail.start.disabled, false, 'A missing thumbnail must not block printing');

  console.log('Bookmarklet host, language, and empty-toolhead checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
