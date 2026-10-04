const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/favori_couleurs_fluidd.js', 'utf8');
const tail = fs.readFileSync('tests/fixtures/orca_tail_4.txt', 'utf8');
const installer = fs.readFileSync('dist/Installer_favori_couleurs_Fluidd.html', 'utf8');
const installerScript = installer.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(installerScript, 'Installer copy fallback missing');
new vm.Script(installerScript[1]);
assert.match(installer, /<section lang="en" hidden>/);
assert.match(installer, /Firefox, Chrome, and Edge/);
assert.match(installer, /Keep the <code>javascript:<\/code> prefix/);

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

async function scenario(language, sensors, mapping = true) {
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
    alert: () => { throw new Error('Unexpected alert'); },
    confirm: () => true,
    setTimeout: () => {},
  };
  vm.runInNewContext(source, context);
  for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve));
  const all = descendants(root);
  const title = all.find(element => element.tag === 'h2');
  const file = all.find(element => element.tag === 'select');
  assert.ok(file, 'File selector missing');
  file.value = 'sample.gcode';
  await file.onchange();
  const updated = descendants(root);
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
  assert.deepEqual(chosenSwatches.map(element => element.style.background), ['#000000', '#000000', '#C99542', '#FFFFFF']);
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
  unavailable.toolSelectors.forEach((select, i) => { select.value = String(i); select.onchange(); });
  assert.equal(unavailable.start.disabled, true, 'Unknown sensor state must disable print');
  await unavailable.start.onclick();
  assert.equal(unavailable.calls.filter(call => call.method === 'POST').length, 0, 'Unknown sensor state must not trigger a POST');

  const disabled = await scenario('en-US', ['disabled', true, true, true]);
  assert.equal(disabled.start.disabled, true, 'Disabled sensor must disable print');

  console.log('Bookmarklet host, language, and empty-toolhead checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
