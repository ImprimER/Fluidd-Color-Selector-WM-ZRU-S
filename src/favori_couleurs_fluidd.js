(() => {
  'use strict';
  const locale=/^fr\b/i.test(navigator.language||'')?'fr':'en';
  const tr=(fr,en)=>locale==='fr'?fr:en;
  if (!/^https?:$/.test(location.protocol)) {
    alert(tr('Ouvrez Fluidd dans le navigateur avant de lancer ce favori.','Open Fluidd in your browser before using this bookmark.'));
    return;
  }
  const old = document.getElementById('codex-orca-colors');
  if (old) { old.remove(); return; }
  const host = document.createElement('div');
  host.id = 'codex-orca-colors';
  document.documentElement.append(host);
  const shadow = host.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  style.textContent = `
    :host{all:initial} .shade{position:fixed;inset:0;z-index:2147483647;background:#000b;display:grid;place-items:center;font:15px Arial,sans-serif;color:#eee}
    .box{box-sizing:border-box;width:min(620px,94vw);max-height:92vh;overflow:auto;background:#25262a;border:1px solid #555;border-radius:12px;box-shadow:0 15px 50px #0008;padding:22px}
    h2{font-size:20px;margin:0 0 18px} h3{font-size:15px;margin:18px 0 8px} p{margin:8px 0 14px;line-height:1.35}
    input,select,button{box-sizing:border-box;font:inherit} input,select{width:100%;padding:9px;background:#35363a;color:#fff;border:1px solid #666;border-radius:5px}
    button{cursor:pointer;border:0;border-radius:5px;background:#494b50;color:#fff;padding:9px 13px} button:hover{filter:brightness(1.15)} button.primary{background:#24a700;font-weight:bold}
    button:disabled{opacity:.45;cursor:default}.row{display:grid;grid-template-columns:minmax(130px,1fr) 20px minmax(200px,1.5fr);align-items:center;gap:10px;margin:10px 0;padding:9px;background:#303136;border-radius:7px}
    .swatch{width:30px;height:30px;border:1px solid #999;border-radius:50%;flex:none}.head-choice{position:relative;min-width:0}.head-choice select{width:100%;padding-left:38px}.head-choice .swatch{position:absolute;left:11px;top:50%;z-index:1;transform:translateY(-50%);width:18px;height:18px;pointer-events:none}.model-color{display:flex;align-items:center;gap:9px;font-weight:bold}.arrow{text-align:center;color:#aaa}.buttons{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}
    .status{margin:8px 0;color:#a7daff}.status[hidden],.small[hidden]{display:none}.warn{color:#ffd275}.err{color:#ff9d9d}.small{font-size:13px;color:#bbb}
    .heads{margin:16px 0;padding:12px;border:1px solid #555;border-radius:7px}.heads-title{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:bold}
    .heads-title button{padding:5px 9px;font-size:13px}.heads-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:10px}
    .head{display:flex;align-items:center;gap:6px;padding:7px;background:#303136;border-radius:6px;font-size:13px;white-space:nowrap}.head .swatch{width:19px;height:19px}.head-text{min-width:0;overflow:hidden;text-overflow:ellipsis}
    .file-preview{display:flex;align-items:center;gap:12px;margin-top:10px;padding:8px;background:#303136;border-radius:7px}.file-preview[hidden],.file-preview img[hidden],.preview-colors[hidden]{display:none}.file-preview img{width:96px;height:96px;flex:none;object-fit:contain;background:#202125;border-radius:5px}.preview-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 14px;flex:1;min-width:0}.preview-stat{min-width:0}.preview-stat span{display:block;color:#bbb;font-size:12px}.preview-stat strong{display:block;font-size:14px;font-weight:600;white-space:nowrap}.preview-colors{display:grid;grid-template-columns:repeat(2,24px);gap:6px;flex:none;align-content:center}.preview-colors .swatch{width:24px;height:24px}
    .credit{margin:12px 0 0;text-align:right;color:#92969e;font-size:11px}
    @media(max-width:560px){.heads-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.row{grid-template-columns:1fr}.arrow{display:none}}
  `;
  shadow.append(style);
  const shade = document.createElement('div'); shade.className = 'shade'; shadow.append(shade);
  const box = document.createElement('div'); box.className = 'box'; shade.append(box);
  const h = document.createElement('h2'); h.textContent = tr('Imprimer avec les couleurs','Print with colors'); box.append(h);
  const headsBox=document.createElement('div');headsBox.className='heads';box.append(headsBox);
  const headsTitle=document.createElement('div');headsTitle.className='heads-title';headsBox.append(headsTitle);
  const headsLabel=document.createElement('span');headsLabel.textContent=tr('Couleurs chargées dans l’imprimante','Colors loaded in the printer');headsTitle.append(headsLabel);
  const refreshHeads=document.createElement('button');refreshHeads.textContent=tr('Actualiser','Refresh');headsTitle.append(refreshHeads);
  const headsGrid=document.createElement('div');headsGrid.className='heads-grid';headsBox.append(headsGrid);
  const headsNote=document.createElement('div');headsNote.className='small';headsBox.append(headsNote);
  const fileTitle=document.createElement('h3');fileTitle.textContent=tr('1. Choisir le fichier','1. Choose the file');box.append(fileTitle);
  const status = document.createElement('div'); status.className = 'status'; status.setAttribute('role','status'); box.append(status);
  const filter = document.createElement('input'); filter.placeholder=tr('Rechercher un fichier','Search files'); box.append(filter);
  const fileSelect = document.createElement('select'); fileSelect.style.marginTop='8px'; box.append(fileSelect);
  const preview=document.createElement('div');preview.className='file-preview';preview.hidden=true;box.append(preview);
  const previewImage=document.createElement('img');previewImage.alt=tr('Aperçu du modèle','Model preview');previewImage.decoding='async';preview.append(previewImage);
  const previewDetails=document.createElement('div');previewDetails.className='preview-details';preview.append(previewDetails);
  const previewColors=document.createElement('div');previewColors.className='preview-colors';previewColors.hidden=true;previewColors.setAttribute('role','group');previewColors.setAttribute('aria-label',tr('Couleurs du modèle','Model colors'));preview.append(previewColors);
  const mappingTitle=document.createElement('h3');mappingTitle.textContent=tr('2. Couleurs du fichier → têtes','2. File colors → toolheads');mappingTitle.hidden=true;box.append(mappingTitle);
  const choices = document.createElement('div'); box.append(choices);
  const dup = document.createElement('p'); dup.className='warn'; dup.hidden=true; box.append(dup);
  const headWarning = document.createElement('p'); headWarning.className='warn'; headWarning.hidden=true; box.append(headWarning);
  const buttons = document.createElement('div'); buttons.className='buttons'; box.append(buttons);
  const cancel = document.createElement('button'); cancel.textContent=tr('Fermer','Close'); cancel.onclick=()=>host.remove(); buttons.append(cancel);
  const start = document.createElement('button'); start.textContent=tr('Confirmer et imprimer','Confirm and print'); start.className='primary'; start.disabled=true; buttons.append(start);
  const credit=document.createElement('div');credit.className='credit';credit.textContent="by Imprim'ER";box.append(credit);
  let files=[], selected=null, rows=[], busy=false, sequence=0, headColors=null, headPresence=null, headLoading=false;
  function message(value, cls='status'){status.className=cls;status.textContent=value;status.hidden=!value;}
  async function api(path, options){
    const response=await fetch(path,{credentials:'same-origin',...options});
    const body=await response.json().catch(()=>null);
    if (!response.ok || (body && body.error)) throw new Error(body?.error?.message || `HTTP ${response.status}`);
    return body?.result ?? body;
  }
  async function checkPrinterMapping(){
    const result=await api('/printer/objects/query?configfile');
    const config=result?.status?.configfile?.config;
    const invalid=!(config?.save_variables && config['gcode_macro _CHANGE_TOOL']);
    if(invalid)throw new Error(tr('Configuration Klipper incompatible : variables ou macro de changement de tête absentes.','Incompatible Klipper configuration: saved variables or tool-change macro missing.'));
    for(let i=0;i<4;i++){
      const gcode=config[`gcode_macro T${i}`]?.gcode;
      if(typeof gcode!=='string' || !new RegExp(`\\bbox_modify_t${i}\\b`).test(gcode) || !gcode.includes('_CHANGE_TOOL'))
        throw new Error(tr(`La macro T${i} ne lit pas la correspondance box_modify_t${i} : impression bloquée.`,`T${i} macro does not read box_modify_t${i}: printing blocked.`));
    }
  }
  function option(parent,value,label){const e=document.createElement('option');e.value=value;e.textContent=label;parent.append(e);return e;}
  // Indices du sélecteur de l'écran, lus ligne par ligne de gauche à droite.
  // Les nuances sont approximatives; le code reste visible pour lever toute ambiguïté.
  const palette={
    0:{name:tr('Blanc','White'),hex:'#FFFFFF'},
    1:{name:tr('Blanc cassé','Off-white'),hex:'#E8E9D7'},
    2:{name:tr('Ocre','Ochre'),hex:'#C99542'},
    3:{name:tr('Bleu clair','Light blue'),hex:'#A4E8F0'},
    4:{name:tr('Noir','Black'),hex:'#000000'},
    5:{name:'Cyan',hex:'#00D5DE'},
    6:{name:tr('Bleu ciel','Sky blue'),hex:'#009DF0'},
    7:{name:tr('Bleu','Blue'),hex:'#0000FF'},
    8:{name:tr('Vert vif','Bright green'),hex:'#12E900'},
    9:{name:tr('Vert','Green'),hex:'#00B96B'},
    10:{name:tr('Jaune','Yellow'),hex:'#FFFF00'},
    11:{name:tr('Corail','Coral'),hex:'#FF7850'},
    12:{name:tr('Rose pâle','Light pink'),hex:'#DDBFDE'},
    13:{name:tr('Rose','Pink'),hex:'#DE4ADD'},
    14:{name:tr('Rouge','Red'),hex:'#FF3E55'},
    15:{name:tr('Violet','Purple'),hex:'#554AFF'},
    16:{name:tr('Jaune et bleu','Yellow and blue'),css:'conic-gradient(#F4DD00,#A4F0F0,#F4DD00)'},
    17:{name:tr('Cuivré','Copper'),css:'conic-gradient(#B97B4D,#F6EEE2,#B97B4D)'},
    18:{name:tr('Argenté','Silver'),css:'conic-gradient(#627F91,#D8EDF4,#627F91)'},
    19:{name:tr('Arc-en-ciel','Rainbow'),css:'linear-gradient(90deg,#852FE5,#FF6CBB,#F9D72E,#27C549,#17B6DD)'},
    20:{name:tr('Transparent','Transparent'),css:'repeating-conic-gradient(#d5e8ee 0% 25%,#8db7c9 0% 50%) 50% / 12px 12px'}
  };
  function parseHeadColors(ini){
    let inSlot=false;
    const values={};
    for(const line of ini.split(/\r?\n/)){
      const section=line.match(/^\s*\[([^\]]+)\]\s*$/);
      if(section){inSlot=section[1].toLowerCase()==='slot';continue;}
      if(!inSlot)continue;
      const match=line.match(/^\s*color([0-3])\s*=\s*(\d+)\s*(?:[;#].*)?$/i);
      if(match)values[Number(match[1])]=Number(match[2]);
    }
    if([0,1,2,3].some(i=>!Number.isInteger(values[i])))throw new Error(tr('Quatre couleurs de tête introuvables dans tmt1.ini.','Four toolhead colors were not found in tmt1.ini.'));
    return values;
  }
  function headDescription(i){
    const present=headPresence?.[i],code=headColors?.[i],color=palette[code];
    if(present===false)return {name:tr('Vide','Empty'),swatch:'transparent',empty:true};
    if(present!==true)return {name:tr('À vérifier','Unknown'),swatch:'#777'};
    if(code===undefined)return {name:tr('Couleur inconnue','Color unknown'),swatch:'#777'};
    return {name:color?.name||`${tr('Code','Code')} ${code}`,swatch:color?.css||color?.hex||'#777',code};
  }
  function renderHeads(note=''){
    headsGrid.replaceChildren();
    for(let i=0;i<4;i++){
      const info=headDescription(i);
      const row=document.createElement('div');row.className='head';row.title=info.code===undefined?'':`${tr('Code écran','Screen code')} ${info.code}`;headsGrid.append(row);
      const swatch=document.createElement('div');swatch.className='swatch';swatch.style.background=info.swatch;
      if(info.empty)swatch.style.borderStyle='dashed';row.append(swatch);
      const label=document.createElement('span');label.className='head-text';
      label.textContent=`T${i} · ${info.name}`;row.append(label);
    }
    headsNote.hidden=!note;headsNote.textContent=note;
    for(const row of rows){renderHeadOptions(row.select,row.select.value);updateHeadSwatch(row);}
    updateDuplicate();
  }
  function updateHeadSwatch(row){
    const info=row.select.value===''?null:headDescription(Number(row.select.value));
    row.headSwatch.style.background=info?.swatch||'transparent';
    row.headSwatch.style.borderStyle=info?'solid':'dashed';
  }
  function renderHeadOptions(select,value){
    select.replaceChildren();
    option(select,'',tr('Choisir une tête…','Choose a toolhead…'));
    for(let i=0;i<4;i++){
      const entry=option(select,String(i),`T${i} · ${headDescription(i).name}`);
      entry.disabled=headPresence?.[i]!==true;
    }
    select.value=value!==''&&headPresence?.[Number(value)]===true?value:'';
  }
  async function loadHeadColors(){
    headLoading=true;refreshHeads.disabled=true;headsNote.hidden=false;headsNote.textContent=tr('Lecture de l’écran et des capteurs…','Reading screen colors and sensors…');
    headPresence=null;
    updateDuplicate();
    const sensors=Array.from({length:4},(_,i)=>encodeURIComponent(`filament_switch_sensor filament${i}`)).join('&');
    const results=await Promise.allSettled([
      fetch('/server/files/config/tmt1.ini',{credentials:'same-origin',cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return parseHeadColors(await r.text());}),
      api('/printer/objects/query?'+sensors).then(result=>Array.from({length:4},(_,i)=>{
        const sensor=result.status?.[`filament_switch_sensor filament${i}`];
        // Le firmware ne surveille que la tête active ; enabled=false n'invalide pas filament_detected.
        return typeof sensor?.filament_detected==='boolean'?sensor.filament_detected:null;
      }))
    ]);
    headColors=results[0].status==='fulfilled'?results[0].value:null;
    headPresence=results[1].status==='fulfilled'?results[1].value:null;
    headLoading=false;
    const missing=[];
    if(!headColors)missing.push(tr('couleurs de l’écran','screen colors'));
    if(!headPresence || headPresence.some(value=>value===null))missing.push(tr('certains capteurs','some sensors'));
    renderHeads(missing.length?`${tr('Lecture impossible','Could not read')} : ${missing.join(tr(' et ',' and '))}. ${tr('Vérifiez les têtes sur l’imprimante.','Check the toolheads on the printer.')}`:'');
    refreshHeads.disabled=busy;
    return headPresence;
  }
  refreshHeads.onclick=loadHeadColors;
  renderHeads(tr('Lecture de l’écran et des capteurs…','Reading screen colors and sensors…'));
  function updateDuplicate(){
    const chosen=rows.filter(r=>r.select.value!=='');
    const heads=chosen.map(r=>Number(r.select.value));
    const repeated=[...new Set(heads.filter((h,i)=>heads.indexOf(h)!==i))];
    dup.hidden=repeated.length===0;
    const names=repeated.map(h=>`T${h}`);
    dup.textContent=repeated.length ? tr(`Attention : ${names.join(', ')} ${repeated.length===1?'est choisie':'sont choisies'} plusieurs fois. Ces zones du modèle auront la même couleur de filament.`,`Warning: ${names.join(', ')} ${repeated.length===1?'is':'are'} selected more than once. Those model areas will use the same filament color.`) : '';
    const unavailable=chosen.filter(r=>headPresence?.[Number(r.select.value)]!==true);
    headWarning.hidden=!rows.length||headLoading||!!headPresence&&unavailable.length===0;
    headWarning.textContent=!rows.length?'':!headPresence
      ?tr('Capteurs indisponibles. Actualisez pour réessayer.','Sensors unavailable. Refresh to try again.')
      :unavailable.length?tr('Une tête choisie est vide.','A selected toolhead is empty.'):'';
    start.disabled=busy||!selected||!rows.length||chosen.length!==rows.length||unavailable.length>0;
  }
  function parseTail(tail){
    const colorLine=tail.match(/^;\s*filament_colour\s*=\s*(.+)$/im);
    const usedLine=tail.match(/^;\s*filament used \[mm\]\s*=\s*(.+)$/im);
    if(!colorLine || !usedLine) throw new Error(tr('Couleurs ou outils utilisés introuvables dans ce G-code OrcaSlicer. Impression bloquée.','Colors or used tools not found in this OrcaSlicer G-code. Printing blocked.'));
    const colors=colorLine[1].trim().split(';').map(x=>x.trim());
    const used=usedLine[1].trim().split(/[;,]/).map(x=>Number(x.trim()));
    if(colors.length>4 || used.length>4 || !used.length || used.some(x=>!Number.isFinite(x))) throw new Error(tr('Métadonnées des filaments non reconnues. Impression bloquée.','Filament metadata not recognized. Printing blocked.'));
    const slots=[];
    for(let i=0;i<used.length;i++) if(used[i]>0){
      if(!/^#[0-9a-f]{6}$/i.test(colors[i]||'')) throw new Error(`${tr('Couleur','Color')} T${i} ${tr('non reconnue. Impression bloquée.','not recognized. Printing blocked.')}`);
      slots.push({index:i,color:colors[i].toUpperCase()});
    }
    if(!slots.length) throw new Error(tr('Aucune tête utilisée détectée. Impression bloquée.','No used tool detected. Printing blocked.'));
    return slots;
  }
  function fileUrl(path){return '/server/files/gcodes/'+path.split('/').map(encodeURIComponent).join('/');}
  function addPreviewStat(label,value){
    const stat=document.createElement('div');stat.className='preview-stat';previewDetails.append(stat);
    const caption=document.createElement('span');caption.textContent=label;stat.append(caption);
    const number=document.createElement('strong');number.textContent=value;stat.append(number);
  }
  function updatePreviewVisibility(){preview.hidden=previewImage.hidden&&previewDetails.children.length===0&&previewColors.hidden;}
  function renderPreviewColors(slots){
    previewColors.replaceChildren();
    for(const slot of slots){
      const swatch=document.createElement('div');swatch.className='swatch';swatch.style.backgroundColor=slot.color;
      swatch.title=`${tr('Couleur','Color')} ${slot.index+1} · ${slot.color}`;previewColors.append(swatch);
    }
    previewColors.hidden=slots.length===0;
    updatePreviewVisibility();
  }
  function compactNumber(value){return new Intl.NumberFormat(locale==='fr'?'fr-FR':'en-US',{maximumFractionDigits:1}).format(value);}
  function renderFileInfo(file,metadata){
    previewDetails.replaceChildren();
    const seconds=Number(metadata?.estimated_time);
    if(Number.isFinite(seconds)&&seconds>0){
      const minutes=Math.max(1,Math.round(seconds/60)),hours=Math.floor(minutes/60);
      addPreviewStat(tr('Durée estimée','Estimated time'),hours?`${hours} h${minutes%60?` ${minutes%60} min`:''}`:`${minutes} min`);
    }
    const grams=Number(metadata?.filament_weight_total),millimeters=Number(metadata?.filament_total);
    if(Number.isFinite(grams)&&grams>0)addPreviewStat(tr('Filament','Filament'),`${compactNumber(grams)} g`);
    else if(Number.isFinite(millimeters)&&millimeters>0)addPreviewStat(tr('Filament','Filament'),`${compactNumber(millimeters/1000)} m`);
    const bytes=Number(metadata?.size)||Number(file.size);
    if(Number.isFinite(bytes)&&bytes>0)addPreviewStat(tr('Taille du fichier','File size'),bytes>=1000000?`${compactNumber(bytes/1000000)} ${tr('Mo','MB')}`:`${compactNumber(bytes/1000)} ${tr('ko','kB')}`);
    const height=Number(metadata?.object_height);
    if(Number.isFinite(height)&&height>0)addPreviewStat(tr('Hauteur','Height'),`${compactNumber(height)} mm`);
    updatePreviewVisibility();
  }
  async function loadFileInfo(file,token){
    let metadata=null;
    try{metadata=await api('/server/files/metadata?filename='+encodeURIComponent(file.path));}
    catch(_){/* Les détails sont facultatifs ; le fichier reste imprimable. */}
    if(token!==sequence)return;
    renderFileInfo(file,metadata);
    const thumbnails=metadata?.thumbnails;
    if(!Array.isArray(thumbnails))return;
    const valid=thumbnails.filter(t=>typeof t.relative_path==='string' && t.relative_path.split('/').every(part=>part&&part!=='.'&&part!=='..') &&
      Number.isFinite(t.width)&&Number.isFinite(t.height)&&t.width>0&&t.height>0&&Number.isFinite(t.size)&&t.size<=256000);
    valid.sort((a,b)=>Math.abs(Math.max(a.width,a.height)-96)-Math.abs(Math.max(b.width,b.height)-96));
    if(!valid.length)return;
    previewImage.onerror=()=>{if(token===sequence){previewImage.hidden=true;updatePreviewVisibility();}};
    previewImage.hidden=false;
    previewImage.src=fileUrl([...file.path.split('/').slice(0,-1),valid[0].relative_path].join('/'));
    preview.hidden=false;
  }
  async function readColors(file){
    const response=await fetch(fileUrl(file.path),{headers:{Range:'bytes=-131072'},credentials:'same-origin'});
    if(!response.ok || (response.status!==206 && file.size>131072)) throw new Error(tr('Lecture de la fin du G-code impossible. Impression bloquée.','Could not read the end of the G-code. Printing blocked.'));
    return parseTail(await response.text());
  }
  function renderList(){
    const query=filter.value.toLocaleLowerCase();
    const previous=fileSelect.value;
    fileSelect.replaceChildren(); option(fileSelect,'',tr('Choisir un fichier…','Choose a file…'));
    for(const f of files.filter(x=>x.path.toLocaleLowerCase().includes(query))) option(fileSelect,f.path,f.path);
    if([...fileSelect.options].some(x=>x.value===previous)) fileSelect.value=previous;
  }
  async function chooseFile(){
    const token=++sequence; selected=null;rows=[];choices.replaceChildren();mappingTitle.hidden=true;start.disabled=true;dup.hidden=true;headWarning.hidden=true;
    preview.hidden=true;previewImage.hidden=true;previewImage.onerror=null;previewImage.src='';previewDetails.replaceChildren();previewColors.replaceChildren();previewColors.hidden=true;
    const path=fileSelect.value; if(!path)return;
    const file=files.find(f=>f.path===path); if(!file)return;
    loadFileInfo(file,token);
    message(tr('Lecture des couleurs…','Reading colors…'));
    try{
      const slots=await readColors(file); if(token!==sequence)return;
      selected=file;
      renderPreviewColors(slots);
      mappingTitle.hidden=false;
      mappingTitle.textContent=tr(`2. Couleurs du fichier → têtes (${slots.length})`,`2. File colors → toolheads (${slots.length})`);
      for(const slot of slots){
        const line=document.createElement('div');line.className='row';choices.append(line);
        const model=document.createElement('div');model.className='model-color';line.append(model);
        const swatch=document.createElement('div');swatch.className='swatch';swatch.style.backgroundColor=slot.color;swatch.title=slot.color;model.append(swatch);
        const label=document.createElement('span');label.textContent=`${tr('Couleur','Color')} ${slot.index+1}`;model.append(label);
        const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='→';line.append(arrow);
        const headChoice=document.createElement('div');headChoice.className='head-choice';line.append(headChoice);
        const headSwatch=document.createElement('div');headSwatch.className='swatch chosen-head-swatch';headChoice.append(headSwatch);
        const select=document.createElement('select');select.setAttribute('aria-label',`${tr('Tête physique pour la couleur','Physical toolhead for color')} ${slot.index+1}`);headChoice.append(select);
        const row={slot,select,headSwatch};rows.push(row);
        renderHeadOptions(select,'');
        updateHeadSwatch(row);
        select.onchange=()=>{updateHeadSwatch(row);updateDuplicate();};
      }
      updateDuplicate();message('');
    }catch(e){if(token===sequence)message(e.message,'err');}
  }
  filter.oninput=renderList;
  fileSelect.onchange=chooseFile;
  start.onclick=async()=>{
    if(busy || !selected || !rows.length || rows.some(r=>r.select.value===''))return;
    const map=[0,1,2,3];for(const row of rows)map[row.slot.index]=Number(row.select.value);
    if(map.some(x=>!Number.isInteger(x)||x<0||x>3))return;
    const unique=new Set(rows.map(r=>r.select.value));
    if(unique.size<rows.length && !confirm(tr('Plusieurs couleurs du modèle utilisent la même tête physique : elles seront imprimées avec le même filament. Continuer ?','Several model colors use the same physical toolhead and will print with the same filament. Continue?')))return;
    busy=true;start.disabled=true;fileSelect.disabled=true;filter.disabled=true;
    try{
      message(tr('Vérification avant impression…','Checking before printing…'));
      await checkPrinterMapping();
      const presence=await loadHeadColors();
      if(!presence)throw new Error(tr('Impossible de vérifier les capteurs de filament.','Could not verify the filament sensors.'));
      const empty=rows.map(r=>Number(r.select.value)).filter(head=>presence[head]!==true);
      if(empty.length)throw new Error(tr(`Tête(s) T${[...new Set(empty)].join(', T')} sans filament.`,`Toolhead(s) T${[...new Set(empty)].join(', T')} have no filament.`));
      const state=await api('/printer/objects/query?print_stats&save_variables');
      if(!['standby','complete','cancelled','error'].includes(state.status?.print_stats?.state))throw new Error(tr('La machine imprime déjà ou son état est incertain.','The printer is already printing or its status is uncertain.'));
      const current=(await api('/server/files/list?root=gcodes')).find(f=>f.path===selected.path);
      if(!current || current.size!==selected.size || current.modified!==selected.modified)throw new Error(tr('Le fichier a changé. Rechargez ses couleurs avant de lancer.','The file changed. Reload its colors before starting.'));
      const previous=state.status?.save_variables?.variables||{};
      const script=[];
      for(let i=0;i<4;i++){
        script.push(`SAVE_VARIABLE VARIABLE=box_modify_t${i} VALUE=${map[i]}`);
        script.push(`SAVE_VARIABLE VARIABLE=box_modify_t${i}_backup VALUE=${map[i]}`);
      }
      message(tr('Enregistrement des têtes…','Saving toolhead mapping…'));
      await api('/printer/gcode/script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({script:script.join('\n')})});
      try{
        message(tr('Démarrage du G-code original…','Starting the original G-code…'));
        await api('/printer/print/start?filename='+encodeURIComponent(selected.path),{method:'POST'});
      }catch(startError){
        const afterFailure=await api('/printer/objects/query?print_stats').catch(()=>null);
        if(!afterFailure) throw new Error(tr('État de la machine inconnu après la demande de démarrage. Vérifiez Fluidd avant toute autre action.','Printer status is unknown after the start request. Check Fluidd before taking any other action.'));
        if(['printing','paused'].includes(afterFailure?.status?.print_stats?.state))
          throw new Error(tr('La machine semble avoir démarré malgré une réponse réseau manquante. Vérifiez Fluidd avant toute autre action.','The printer appears to have started despite a missing network response. Check Fluidd before taking any other action.'));
        const restore=[];
        for(let i=0;i<4;i++)for(const suffix of ['', '_backup']){
          const key=`box_modify_t${i}${suffix}`;const value=previous[key];
          if(Number.isInteger(value)&&value>=0&&value<=3)restore.push(`SAVE_VARIABLE VARIABLE=${key} VALUE=${value}`);
        }
        if(restore.length)await api('/printer/gcode/script',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({script:restore.join('\n')})}).catch(()=>{});
        throw startError;
      }
      message(tr('Impression démarrée.','Print started.'));setTimeout(()=>host.remove(),1800);
    }catch(e){message(`${tr('Impression non lancée','Print not started')} : ${e.message}`,'err');busy=false;fileSelect.disabled=false;filter.disabled=false;refreshHeads.disabled=false;updateDuplicate();}
  };
  (async()=>{try{
    message(tr('Connexion à Fluidd…','Connecting to Fluidd…'));
    const server=await api('/server/info');
    if(!server?.moonraker_version)throw new Error(tr('Cette page ne répond pas comme un serveur Moonraker. Ouvrez Fluidd.','This page is not responding as a Moonraker server. Open Fluidd.'));
    message(tr('Chargement des fichiers…','Loading files…'));
    const list=await api('/server/files/list?root=gcodes');
    files=list.filter(f=>/\.gcode$/i.test(f.path)).sort((a,b)=>b.modified-a.modified);
    renderList();message(files.length?'':tr('Aucun fichier G-code disponible.','No G-code files available.'));
    loadHeadColors();
  }catch(e){message(`${tr('Impossible de lire les fichiers','Could not load files')} : ${e.message}`,'err');}})();
})();
