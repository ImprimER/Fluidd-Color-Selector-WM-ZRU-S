from pathlib import Path
from html import escape
from urllib.parse import quote

root = Path(__file__).resolve().parents[1]
script = (root / 'src' / 'favori_couleurs_fluidd.js').read_text(encoding='utf-8')
url = 'javascript:' + quote(script, safe="(){}[];,.:/+-*='!~")
safe_url = escape(url, quote=True)

html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Favori couleurs Fluidd / Fluidd color bookmark</title>
<style>
  :root{{font-family:Arial,Helvetica,sans-serif;color-scheme:light}}
  *{{box-sizing:border-box}}
  body{{margin:0;background:#f3f5f7;color:#17212b;line-height:1.5}}
  main{{max-width:680px;margin:56px auto;padding:0 20px}}
  .card{{background:#fff;border:1px solid #dce2e7;border-radius:16px;padding:32px;box-shadow:0 12px 36px #16232f0d}}
  .top{{display:flex;align-items:center;justify-content:space-between;gap:16px}}
  .eyebrow{{font-size:13px;font-weight:700;color:#317047;letter-spacing:.06em;text-transform:uppercase}}
  .language{{font:inherit;font-size:14px;padding:7px 9px;border:1px solid #cbd3d9;border-radius:7px;background:#fff;color:#17212b}}
  h1{{font-size:30px;line-height:1.2;margin:16px 0 8px}}
  .lead{{margin:0 0 26px;color:#485762}}
  h2{{font-size:17px;margin:0 0 12px}}
  ol{{margin:0;padding-left:24px}}
  li{{padding-left:4px;margin:9px 0}}
  .install{{margin:26px 0;text-align:center}}
  .bookmark{{display:inline-block;background:#198a34;color:#fff;font-weight:700;text-decoration:none;border-radius:9px;padding:16px 22px;box-shadow:0 4px 12px #198a3433}}
  .bookmark:hover{{background:#13742b}}
  .hint{{font-size:14px;color:#58656f;margin:10px 0 0}}
  .credit{{margin:20px 0 0;text-align:right;color:#87939c;font-size:12px}}
  .ready{{border-top:1px solid #e5e9ed;padding-top:20px;margin-top:24px}}
  details{{border-top:1px solid #e5e9ed;margin-top:22px;padding-top:17px}}
  summary{{cursor:pointer;font-weight:700}}
  .manual-text{{font-size:14px;color:#485762}}
  button{{font:inherit;cursor:pointer;border:1px solid #cbd3d9;border-radius:7px;background:#fff;padding:9px 12px}}
  button:hover{{background:#f2f5f7}}
  .copy-status{{margin-left:10px;color:#317047;font-size:14px}}
  textarea{{display:block;width:100%;height:64px;margin-top:10px;border:1px solid #cbd3d9;border-radius:7px;padding:8px;color:#394851;font-size:12px;resize:vertical}}
  [hidden]{{display:none!important}}
  @media(max-width:520px){{main{{margin:20px auto;padding:0 12px}}.card{{padding:22px}}h1{{font-size:25px}}.top{{align-items:flex-start}}}}
</style>
</head>
<body>
<main><div class="card">
  <div class="top"><span class="eyebrow">Fluidd · ZR Ultra S</span><select class="language" aria-label="Language / Langue"><option value="fr">Français</option><option value="en">English</option></select></div>
  <section lang="fr">
    <h1>Installer le favori couleurs</h1>
    <p class="lead">Un favori pour choisir les têtes avant de lancer une impression depuis Fluidd.</p>
    <p>Le favori vérifie la compatibilité de la ZR Ultra S avant de lancer l’impression. Aucune modification de la configuration de l’imprimante n’est nécessaire sur une machine compatible.</p>
    <h2>Installation</h2>
    <ol><li>Affichez la barre des favoris de votre navigateur.</li><li>Faites glisser le bouton vert ci-dessous sur cette barre.</li><li>Ouvrez Fluidd et cliquez sur le nouveau favori.</li></ol>
    <div class="install"><a class="bookmark" href="{safe_url}">🎨 Imprimer avec les couleurs</a><p class="hint">Faites glisser ce bouton vers votre barre des favoris.</p></div>
    <div class="ready"><h2>Déjà installé ?</h2><p>Remplacez votre ancien favori par celui-ci pour utiliser la dernière version. Les couleurs des têtes sont relues depuis l’imprimante à l’ouverture du favori.</p></div>
    <p class="hint">Projet expérimental, testé sur une seule ZR Ultra S avec Firefox, Chrome et Edge. Vérifiez les bobines et surveillez le début de chaque impression. Utilisation à vos risques.</p>
    <details><summary>Le glisser-déposer ne fonctionne pas ?</summary><p class="manual-text">Créez un favori, modifiez son adresse et collez le code ci-dessous à la place. Conservez le début <code>javascript:</code>.</p><button type="button" class="copy">Copier l’adresse du favori</button><span class="copy-status" role="status"></span><textarea readonly aria-label="Adresse du favori"></textarea></details>
  </section>
  <section lang="en" hidden>
    <h1>Install the color bookmark</h1>
    <p class="lead">Choose toolheads before starting a print from Fluidd.</p>
    <p>The bookmark checks ZR Ultra S compatibility before starting a print. No printer configuration change is needed on a compatible machine.</p>
    <h2>Install</h2>
    <ol><li>Show your browser’s bookmarks bar.</li><li>Drag the green button below onto that bar.</li><li>Open Fluidd and click the new bookmark.</li></ol>
    <div class="install"><a class="bookmark" href="{safe_url}">🎨 Print with colors</a><p class="hint">Drag this button to your bookmarks bar.</p></div>
    <div class="ready"><h2>Already installed?</h2><p>Replace your previous bookmark with this one to use the latest version. Toolhead colors are read from the printer when you open the bookmark.</p></div>
    <p class="hint">Experimental project, tested on one ZR Ultra S with Firefox, Chrome, and Edge. Check the spools and monitor the start of every print. Use at your own risk.</p>
    <details><summary>Drag and drop not working?</summary><p class="manual-text">Create a bookmark, edit its address, and paste the code below in its place. Keep the <code>javascript:</code> prefix.</p><button type="button" class="copy">Copy bookmark address</button><span class="copy-status" role="status"></span><textarea readonly aria-label="Bookmark address"></textarea></details>
  </section>
  <p class="credit">by Imprim'ER</p>
</div></main>
<script>
const bookmarkAddress = document.querySelector('.bookmark').getAttribute('href');
const language = document.querySelector('.language');
function setLanguage(value) {{
  document.documentElement.lang = value;
  for (const section of document.querySelectorAll('section[lang]'))
    section.hidden = section.lang !== value;
  language.value = value;
}}
setLanguage((navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en');
language.addEventListener('change', () => setLanguage(language.value));
for (const panel of document.querySelectorAll('details')) {{
  const field = panel.querySelector('textarea');
  field.value = bookmarkAddress;
  panel.querySelector('.copy').addEventListener('click', async () => {{
    let copied = false;
    try {{
      if (navigator.clipboard?.writeText) {{
        await navigator.clipboard.writeText(bookmarkAddress);
        copied = true;
      }}
    }} catch (_) {{}}
    if (!copied) {{
      field.focus();
      field.select();
      try {{ copied = document.execCommand('copy'); }} catch (_) {{}}
    }}
    panel.querySelector('.copy-status').textContent = copied
      ? (panel.closest('[lang="fr"]') ? 'Copié.' : 'Copied.')
      : (panel.closest('[lang="fr"]') ? 'Sélectionnez le code et copiez-le manuellement.' : 'Select the code and copy it manually.');
  }});
}}
</script>
</body>
</html>
'''
dest = root / 'dist' / 'Installer_favori_couleurs_Fluidd.html'
dest.write_bytes(html.encode('utf-8'))
print(dest)
print(f'bookmarklet length: {len(url)}')
