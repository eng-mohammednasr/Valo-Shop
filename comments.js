(function(){
  var root = document.getElementById('valo-shop-page');
  if(!root) return;
  var footer = root.querySelector('footer');
  if(!footer) return;

  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyC5EssoHu3xyhwTnewgx4OdSbjBr_EnvMo',
    authDomain: 'valo-shop-30ee1.firebaseapp.com',
    projectId: 'valo-shop-30ee1',
    storageBucket: 'valo-shop-30ee1.firebasestorage.app',
    messagingSenderId: '452540758075',
    appId: '1:452540758075:web:7634d92465aa70e69d041e'
  };
  var FB_VER = '10.14.1';
  var COLLECTION = 'comments';
  var AGENTS_URL = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';
  var MAX_LEN = 500;
  var COOLDOWN_MS = 30000;
  var LS_AGENT = 'valo-comment-agent';
  var LS_LAST = 'valo-comment-last';

  function lang(){ return root.getAttribute('lang') === 'en' ? 'en' : 'ar'; }

  var STR = {
    ar: {
      pick: 'اختار الأيجنت بتاعك',
      pickHint: 'اختار أيجنت',
      placeholder: 'اكتب تعليقك هنا…',
      send: 'ابعت التعليق',
      sending: 'بيتبعت…',
      needAgent: 'اختار أيجنت الأول.',
      needText: 'اكتب تعليق الأول.',
      badWords: 'التعليق فيه ألفاظ مش مسموحة.',
      noLinks: 'الروابط مش مسموحة في التعليقات.',
      wait: 'استنى شوية قبل ما تبعت تعليق تاني.',
      error: 'حصلت مشكلة، جرب تاني.',
      sent: 'اتبعت، شكرًا!',
      empty: 'مفيش تعليقات لسه. كن أول واحد!',
      loading: 'بنحمّل التعليقات…',
      loadFail: 'مقدرناش نحمّل التعليقات دلوقتي.',
      locale: 'ar-EG'
    },
    en: {
      pick: 'Choose your agent',
      pickHint: 'Pick an agent',
      placeholder: 'Write your comment here…',
      send: 'Post comment',
      sending: 'Posting…',
      needAgent: 'Pick an agent first.',
      needText: 'Write a comment first.',
      badWords: 'Your comment contains words that are not allowed.',
      noLinks: 'Links are not allowed in comments.',
      wait: 'Please wait a bit before posting another comment.',
      error: 'Something went wrong, please try again.',
      sent: 'Posted, thanks!',
      empty: 'No comments yet. Be the first!',
      loading: 'Loading comments…',
      loadFail: "Couldn't load comments right now.",
      locale: 'en-US'
    }
  };
  function t(k){ return STR[lang()][k]; }

  var css = [
    '#valo-shop-page #comments{ background:var(--bg-2); border-top:1px solid var(--line); }',
    '#valo-shop-page .cm-box{ background:var(--surface); border:1px solid var(--line); padding:22px; }',
    '#valo-shop-page .cm-label{ color:var(--muted); font-size:13.5px; font-weight:700; margin-bottom:10px; display:block; }',
    '#valo-shop-page .cm-agent-btn{ all:unset; box-sizing:border-box; cursor:pointer; display:inline-flex; align-items:center; gap:12px; background:var(--surface-2); border:1px solid var(--line); padding:8px 16px 8px 12px; transition:border-color .2s ease; }',
    '#valo-shop-page .cm-agent-btn:hover, #valo-shop-page .cm-agent-btn.open{ border-color:var(--red); }',
    '#valo-shop-page .cm-agent-btn .cm-agent-name{ font-weight:800; font-size:15px; }',
    '#valo-shop-page .cm-agent-btn .cm-chev{ color:var(--red); font-size:18px; transition:transform .3s ease; }',
    '#valo-shop-page .cm-agent-btn.open .cm-chev{ transform:rotate(180deg); }',
    '#valo-shop-page .cm-avatar{ width:44px; height:44px; border-radius:50%; background:var(--bg); border:1px solid var(--line); overflow:hidden; flex:none; display:flex; align-items:center; justify-content:center; font-size:22px; }',
    '#valo-shop-page .cm-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }',
    '#valo-shop-page .cm-picker{ display:none; margin-top:14px; border:1px solid var(--line); background:var(--bg); padding:12px; max-height:260px; overflow-y:auto; }',
    '#valo-shop-page .cm-picker.open{ display:block; }',
    '#valo-shop-page .cm-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(78px, 1fr)); gap:10px; }',
    '#valo-shop-page .cm-agent{ all:unset; box-sizing:border-box; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px; padding:8px 4px; border:1px solid transparent; text-align:center; transition:border-color .2s ease, background .2s ease; }',
    '#valo-shop-page .cm-agent:hover{ background:var(--surface); }',
    '#valo-shop-page .cm-agent.selected{ border-color:var(--red); background:var(--surface); }',
    '#valo-shop-page .cm-agent span{ font-size:12px; color:var(--muted); font-weight:700; }',
    '#valo-shop-page .cm-text{ width:100%; margin-top:16px; background:var(--bg); border:1px solid var(--line); color:var(--text); font-family:inherit; font-size:15px; line-height:1.7; padding:12px 14px; resize:vertical; min-height:92px; border-radius:0; }',
    '#valo-shop-page .cm-text:focus{ outline:none; border-color:var(--red); }',
    '#valo-shop-page .cm-row{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-top:12px; }',
    '#valo-shop-page .cm-count{ color:var(--muted-2); font-size:13px; }',
    '#valo-shop-page .cm-msg{ flex:1; font-size:13.5px; color:var(--muted); min-height:1em; }',
    '#valo-shop-page .cm-msg.err{ color:var(--red); }',
    '#valo-shop-page .cm-msg.ok{ color:var(--ice); }',
    '#valo-shop-page .cm-send{ padding:12px 24px; }',
    '#valo-shop-page .cm-send[disabled]{ opacity:.55; cursor:default; }',
    '#valo-shop-page .cm-list{ margin-top:28px; display:flex; flex-direction:column; gap:14px; }',
    '#valo-shop-page .cm-item{ display:flex; gap:14px; align-items:flex-start; background:var(--surface); border:1px solid var(--line); padding:16px; }',
    '#valo-shop-page .cm-body{ min-width:0; flex:1; }',
    '#valo-shop-page .cm-head{ display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-bottom:4px; }',
    '#valo-shop-page .cm-name{ font-weight:800; font-size:15px; }',
    '#valo-shop-page .cm-time{ color:var(--muted-2); font-size:12.5px; }',
    '#valo-shop-page .cm-content{ color:var(--text); font-size:15px; line-height:1.8; margin:0; white-space:pre-wrap; overflow-wrap:anywhere; }',
    '#valo-shop-page .cm-state{ color:var(--muted-2); font-size:14px; text-align:center; padding:18px 0; }'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  root.appendChild(style);

  var section = document.createElement('section');
  section.id = 'comments';
  section.innerHTML =
    '<div class="wrap">' +
      '<div class="section-head">' +
        '<span class="tag" data-ar="التعليقات" data-en="Comments"></span>' +
        '<h2 data-ar="رأيك يهمنا" data-en="Share your thoughts"></h2>' +
        '<p data-ar="سيب تعليقك أو سؤالك هنا. اختار أيجنت من فالورانت يمثلك، ومفيش تسجيل." data-en="Leave a comment or question here. Pick a Valorant agent to represent you — no sign-up needed."></p>' +
      '</div>' +
      '<div class="cm-box">' +
        '<span class="cm-label" id="cm-pick-label"></span>' +
        '<button type="button" class="cm-agent-btn" id="cm-agent-btn" aria-expanded="false">' +
          '<span class="cm-avatar" id="cm-agent-avatar">🎮</span>' +
          '<span class="cm-agent-name" id="cm-agent-name"></span>' +
          '<span class="cm-chev">⌄</span>' +
        '</button>' +
        '<div class="cm-picker" id="cm-picker"><div class="cm-grid" id="cm-grid"></div></div>' +
        '<textarea class="cm-text" id="cm-text" maxlength="' + MAX_LEN + '" rows="3"></textarea>' +
        '<div class="cm-row">' +
          '<span class="cm-count" id="cm-count">0/' + MAX_LEN + '</span>' +
          '<span class="cm-msg" id="cm-msg"></span>' +
          '<button type="button" class="btn btn-primary cm-send" id="cm-send"></button>' +
        '</div>' +
      '</div>' +
      '<div class="cm-list" id="cm-list"></div>' +
    '</div>';
  root.insertBefore(section, footer);

  function $(id){ return document.getElementById(id); }
  var el = {
    pickLabel: $('cm-pick-label'), agentBtn: $('cm-agent-btn'), agentAvatar: $('cm-agent-avatar'),
    agentName: $('cm-agent-name'), picker: $('cm-picker'), grid: $('cm-grid'), text: $('cm-text'),
    count: $('cm-count'), msg: $('cm-msg'), send: $('cm-send'), list: $('cm-list')
  };

  var agents = [];
  var agentsById = {};
  var selected = null;
  var lastDocs = null;
  var listState = 'loading';
  var busy = false;
  var fb = null;

  // ---------- Word filter (client side) ----------
  function norm(s){
    return String(s || '').toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/(.)\1{2,}/g, '$1$1');
  }
  var BAD = {};
  ('fuck fucking fucker motherfucker shit bitch asshole dick pussy cunt nigga nigger whore slut bastard ' +
   'كس كسمك كسام كسختك طيز شرموط شرموطه شراميط عرص عرصه متناك متناكه خول خولات زب زبي منيوك منيوكه قحبه قحاب ينيك لبوه').split(' ')
    .forEach(function(w){ if(w){ BAD[w] = true; } });

  function hasBadWord(text){
    var base = norm(text);
    var leet = base.replace(/@/g, 'a').replace(/\$/g, 's').replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e');
    var variants = [base, leet];
    for(var v = 0; v < variants.length; v++){
      var tokens = variants[v].split(/[^a-z0-9\u0621-\u064A]+/);
      for(var i = 0; i < tokens.length; i++){
        var tk = tokens[i];
        if(!tk){ continue; }
        if(BAD[tk]){ return true; }
        if(tk.length > 3 && BAD[tk.slice(1)]){ return true; }
      }
    }
    return false;
  }

  // ---------- Helpers ----------
  function makeAvatar(agent){
    var wrap = document.createElement('span');
    wrap.className = 'cm-avatar';
    var src = agent && (agent.displayIconSmall || agent.displayIcon);
    if(src){
      var img = document.createElement('img');
      img.src = src;
      img.alt = agent.displayName || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = function(){ wrap.textContent = '🎮'; };
      wrap.appendChild(img);
    } else {
      wrap.textContent = '🎮';
    }
    return wrap;
  }

  function setMsg(text, kind){
    el.msg.textContent = text || '';
    el.msg.className = 'cm-msg' + (kind ? ' ' + kind : '');
  }

  function formatTime(ts){
    try{
      var d = ts && ts.toDate ? ts.toDate() : null;
      if(!d){ return ''; }
      return d.toLocaleString(t('locale'), { dateStyle: 'medium', timeStyle: 'short' });
    }catch(e){ return ''; }
  }

  function renderStatic(){
    el.pickLabel.textContent = t('pick');
    el.text.setAttribute('placeholder', t('placeholder'));
    el.send.textContent = busy ? t('sending') : t('send');
    el.agentName.textContent = selected ? selected.displayName : t('pickHint');
  }

  function renderSelected(){
    var fresh = makeAvatar(selected);
    fresh.id = 'cm-agent-avatar';
    el.agentAvatar.replaceWith(fresh);
    el.agentAvatar = fresh;
    el.agentName.textContent = selected ? selected.displayName : t('pickHint');
    var btns = el.grid.querySelectorAll('.cm-agent');
    btns.forEach(function(b){
      b.classList.toggle('selected', !!selected && b.getAttribute('data-id') === selected.uuid);
    });
  }

  function renderList(){
    el.list.innerHTML = '';
    if(listState === 'loading'){
      var l = document.createElement('div'); l.className = 'cm-state'; l.textContent = t('loading'); el.list.appendChild(l); return;
    }
    if(listState === 'error'){
      var e = document.createElement('div'); e.className = 'cm-state'; e.textContent = t('loadFail'); el.list.appendChild(e); return;
    }
    if(!lastDocs || lastDocs.length === 0){
      var m = document.createElement('div'); m.className = 'cm-state'; m.textContent = t('empty'); el.list.appendChild(m); return;
    }
    lastDocs.forEach(function(c){
      var agent = agentsById[c.agentId];
      var item = document.createElement('div');
      item.className = 'cm-item';
      item.appendChild(makeAvatar(agent));
      var body = document.createElement('div');
      body.className = 'cm-body';
      var head = document.createElement('div');
      head.className = 'cm-head';
      var name = document.createElement('span');
      name.className = 'cm-name';
      name.textContent = agent ? agent.displayName : 'Agent';
      var time = document.createElement('span');
      time.className = 'cm-time';
      time.textContent = formatTime(c.createdAt);
      head.appendChild(name);
      head.appendChild(time);
      var p = document.createElement('p');
      p.className = 'cm-content';
      p.textContent = c.text;
      body.appendChild(head);
      body.appendChild(p);
      item.appendChild(body);
      el.list.appendChild(item);
    });
  }

  function renderPicker(){
    el.grid.innerHTML = '';
    agents.forEach(function(a){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cm-agent';
      b.setAttribute('data-id', a.uuid);
      b.appendChild(makeAvatar(a));
      var n = document.createElement('span');
      n.textContent = a.displayName;
      b.appendChild(n);
      b.addEventListener('click', function(){
        selected = a;
        try{ localStorage.setItem(LS_AGENT, a.uuid); }catch(err){}
        renderSelected();
        togglePicker(false);
      });
      el.grid.appendChild(b);
    });
    renderSelected();
  }

  function togglePicker(force){
    var open = typeof force === 'boolean' ? force : !el.picker.classList.contains('open');
    el.picker.classList.toggle('open', open);
    el.agentBtn.classList.toggle('open', open);
    el.agentBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  el.agentBtn.addEventListener('click', function(){ togglePicker(); });
  el.text.addEventListener('input', function(){
    el.count.textContent = el.text.value.length + '/' + MAX_LEN;
  });

  // ---------- Sending ----------
  function send(){
    if(busy){ return; }
    var text = el.text.value.trim();
    if(!selected){ setMsg(t('needAgent'), 'err'); togglePicker(true); return; }
    if(!text){ setMsg(t('needText'), 'err'); return; }
    if(/(https?:\/\/|www\.)/i.test(text)){ setMsg(t('noLinks'), 'err'); return; }
    if(hasBadWord(text)){ setMsg(t('badWords'), 'err'); return; }
    try{
      var last = Number(localStorage.getItem(LS_LAST)) || 0;
      if(Date.now() - last < COOLDOWN_MS){ setMsg(t('wait'), 'err'); return; }
    }catch(err){}
    if(!fb){ setMsg(t('error'), 'err'); return; }

    busy = true;
    el.send.disabled = true;
    renderStatic();
    setMsg('');
    fb.addDoc(fb.collection(fb.db, COLLECTION), {
      agentId: selected.uuid,
      text: text,
      createdAt: fb.serverTimestamp()
    }).then(function(){
      el.text.value = '';
      el.count.textContent = '0/' + MAX_LEN;
      try{ localStorage.setItem(LS_LAST, String(Date.now())); }catch(err){}
      setMsg(t('sent'), 'ok');
    }).catch(function(){
      setMsg(t('error'), 'err');
    }).then(function(){
      busy = false;
      el.send.disabled = false;
      renderStatic();
    });
  }
  el.send.addEventListener('click', send);

  // ---------- Loading data ----------
  function loadAgents(){
    return fetch(AGENTS_URL)
      .then(function(r){ return r.json(); })
      .then(function(res){
        agents = (res.data || [])
          .filter(function(a){ return a && a.uuid && (a.displayIconSmall || a.displayIcon); })
          .sort(function(a, b){ return a.displayName.localeCompare(b.displayName); });
        agentsById = {};
        agents.forEach(function(a){ agentsById[a.uuid] = a; });
        try{
          var savedId = localStorage.getItem(LS_AGENT);
          if(savedId && agentsById[savedId]){ selected = agentsById[savedId]; }
        }catch(err){}
        renderPicker();
        renderList();
      })
      .catch(function(){});
  }

  function loadFirebase(){
    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    return Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-firestore.js')])
      .then(function(mods){
        var app = mods[0].initializeApp(FIREBASE_CONFIG);
        var f = mods[1];
        fb = {
          db: f.getFirestore(app),
          collection: f.collection,
          addDoc: f.addDoc,
          serverTimestamp: f.serverTimestamp
        };
        var q = f.query(f.collection(fb.db, COLLECTION), f.orderBy('createdAt', 'desc'), f.limit(50));
        f.onSnapshot(q, function(snap){
          lastDocs = snap.docs.map(function(d){
            var data = d.data({ serverTimestamps: 'estimate' });
            return { id: d.id, agentId: data.agentId, text: data.text, createdAt: data.createdAt };
          });
          listState = 'ready';
          renderList();
        }, function(){
          listState = 'error';
          renderList();
        });
      });
  }

  var started = false;
  function start(){
    if(started){ return; }
    started = true;
    loadAgents();
    loadFirebase().catch(function(){
      listState = 'error';
      renderList();
    });
  }

  renderStatic();
  renderList();

  // Re-apply dynamic text when the page language is switched (static text is handled by the page itself).
  if('MutationObserver' in window){
    new MutationObserver(function(){
      renderStatic();
      renderList();
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });
  }

  var lg = lang();
  section.querySelectorAll('[data-ar]').forEach(function(n){
    n.innerHTML = n.getAttribute('data-' + lg);
  });

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          start();
          io.disconnect();
        }
      });
    }, { rootMargin: '300px' });
    io.observe(section);
  } else {
    start();
  }
})();
