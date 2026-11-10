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
  var REPLIES = 'replies';
  var USERS = 'users';
  var AGENTS_URL = 'https://valorant-api.com/v1/agents?isPlayableCharacter=true';
  // Phone notification for new comments (free ntfy.sh topic; subscribe to the same name in the ntfy app).
  var NTFY_TOPIC = 'valoshop-cm-7k2q9x4m8v1r5w3z';
  var MAX_LEN = 500;
  var MAX_NAME = 30;
  var COOLDOWN_MS = 30000;
  var LS_LAST = 'valo-comment-last';
  var LS_ADMIN_AGENT = 'valo-admin-agent';
  var LS_ADMIN_NAME = 'valo-admin-name';

  function lang(){ return root.getAttribute('lang') === 'en' ? 'en' : 'ar'; }

  var STR = {
    ar: {
      pick: 'اختار الأيجنت بتاعك',
      pickHint: 'اختار أيجنت',
      lockedNote: 'الأيجنت ده مربوط بجهازك ومش هتقدر تغيره.',
      unlockedNote: 'اختيارك هيتثبت بعد أول تعليق ومش هتقدر تغيره بعد كده.',
      adminNote: 'بتنشر كمشرف: تقدر تغيّر الأيجنت والاسم في أي وقت.',
      rateLabel: 'قيّم التطبيق',
      rateUnlocked: 'التقييم بيتثبت مع أول تعليق ومش هتقدر تغيره بعد كده.',
      rateLocked: 'تقييمك مربوط بجهازك ومش هتقدر تغيره.',
      needRating: 'اختار تقييم بالنجوم الأول.',
      ratingsCount: '{n} تقييم',
      commentsCount: '{n} تعليق',
      noRatings: 'لسه مفيش تقييمات',
      statsTitle: 'تقييمات التطبيق',
      nameLabel: 'الاسم الظاهر (اختياري)',
      namePlaceholder: 'مثلاً: فريق Valo Shop',
      badge: 'مشرف',
      reply: 'رد',
      replyPlaceholder: 'اكتب ردك…',
      replySend: 'ابعت الرد',
      cancel: 'إلغاء',
      confirmPick: 'هتختار «{n}» وتقييم {r} من 5 ومش هتقدر تغيّرهم بعد كده. متأكد؟',
      confirmPickNoRate: 'هتختار «{n}» ومش هتقدر تغيره بعد كده. متأكد؟',
      placeholder: 'اكتب تعليقك هنا…',
      send: 'ابعت التعليق',
      sending: 'بيتبعت…',
      preparing: 'بنجهّز حسابك…',
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
      adminLogin: 'دخول المشرف (Google)',
      adminLogout: 'خروج',
      adminAs: 'مشرف: ',
      adminFail: 'مقدرناش نسجّل دخول المشرف.',
      del: 'مسح',
      delConfirm: 'تمسح التعليق ده؟',
      delFail: 'معرفناش نمسح التعليق.',
      locale: 'ar-EG'
    },
    en: {
      pick: 'Choose your agent',
      pickHint: 'Pick an agent',
      lockedNote: 'This agent is tied to your device and cannot be changed.',
      unlockedNote: 'Your choice is locked after your first comment and cannot be changed later.',
      adminNote: 'Posting as admin: you can change the agent and name any time.',
      rateLabel: 'Rate the app',
      rateUnlocked: 'Your rating is locked with your first comment and cannot be changed later.',
      rateLocked: 'Your rating is tied to your device and cannot be changed.',
      needRating: 'Pick a star rating first.',
      ratingsCount: '{n} ratings',
      commentsCount: '{n} comments',
      noRatings: 'No ratings yet',
      statsTitle: 'App ratings',
      nameLabel: 'Display name (optional)',
      namePlaceholder: 'e.g. Valo Shop Team',
      badge: 'Admin',
      reply: 'Reply',
      replyPlaceholder: 'Write your reply…',
      replySend: 'Post reply',
      cancel: 'Cancel',
      confirmPick: 'You are picking "{n}" with a {r}/5 rating and will not be able to change them later. Continue?',
      confirmPickNoRate: 'You are picking "{n}" and will not be able to change it later. Continue?',
      placeholder: 'Write your comment here…',
      send: 'Post comment',
      sending: 'Posting…',
      preparing: 'Setting things up…',
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
      adminLogin: 'Admin sign-in (Google)',
      adminLogout: 'Sign out',
      adminAs: 'Admin: ',
      adminFail: "Couldn't sign in as admin.",
      del: 'Delete',
      delConfirm: 'Delete this comment?',
      delFail: "Couldn't delete the comment.",
      locale: 'en-US'
    }
  };
  function t(k){ return STR[lang()][k]; }

  var css = [
    '#valo-shop-page #comments{ background:var(--bg-2); border-top:1px solid var(--line); }',
    '#valo-shop-page .cm-stats{ display:flex; gap:32px; align-items:center; flex-wrap:wrap; background:var(--surface); border:1px solid var(--line); padding:22px; margin-bottom:18px; }',
    '#valo-shop-page .cm-avg{ text-align:center; min-width:120px; }',
    '#valo-shop-page .cm-avg-num{ font-size:46px; font-weight:900; line-height:1.1; }',
    '#valo-shop-page .cm-avg-stars{ color:var(--gold); font-size:18px; letter-spacing:2px; margin:4px 0; }',
    '#valo-shop-page .cm-avg-sub{ color:var(--muted); font-size:13px; }',
    '#valo-shop-page .cm-bars{ flex:1; min-width:200px; display:flex; flex-direction:column; gap:7px; }',
    '#valo-shop-page .cm-bar-row{ display:flex; align-items:center; gap:10px; font-size:13px; color:var(--muted); }',
    '#valo-shop-page .cm-bar-label{ width:26px; flex:none; text-align:center; font-weight:700; }',
    '#valo-shop-page .cm-bar-track{ flex:1; height:8px; background:var(--surface-2); border:1px solid var(--line); overflow:hidden; }',
    '#valo-shop-page .cm-bar-fill{ height:100%; background:var(--gold); }',
    '#valo-shop-page .cm-bar-count{ width:34px; flex:none; text-align:end; color:var(--muted-2); }',
    '#valo-shop-page .cm-box{ background:var(--surface); border:1px solid var(--line); padding:22px; }',
    '#valo-shop-page .cm-label{ color:var(--muted); font-size:13.5px; font-weight:700; margin-bottom:10px; display:block; }',
    '#valo-shop-page .cm-agent-btn{ all:unset; box-sizing:border-box; cursor:pointer; display:inline-flex; align-items:center; gap:12px; background:var(--surface-2); border:1px solid var(--line); padding:8px 16px 8px 12px; transition:border-color .2s ease; }',
    '#valo-shop-page .cm-agent-btn:hover, #valo-shop-page .cm-agent-btn.open{ border-color:var(--red); }',
    '#valo-shop-page .cm-agent-btn.locked{ cursor:default; border-color:var(--line); }',
    '#valo-shop-page .cm-agent-btn.locked .cm-chev{ display:none; }',
    '#valo-shop-page .cm-agent-btn .cm-agent-name{ font-weight:800; font-size:15px; }',
    '#valo-shop-page .cm-agent-btn .cm-chev{ color:var(--red); font-size:18px; transition:transform .3s ease; }',
    '#valo-shop-page .cm-agent-btn.open .cm-chev{ transform:rotate(180deg); }',
    '#valo-shop-page .cm-note{ display:block; color:var(--muted-2); font-size:13px; margin-top:10px; }',
    '#valo-shop-page .cm-avatar{ width:44px; height:44px; border-radius:50%; background:var(--bg); border:1px solid var(--line); overflow:hidden; flex:none; display:flex; align-items:center; justify-content:center; font-size:22px; }',
    '#valo-shop-page .cm-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }',
    '#valo-shop-page .cm-picker{ display:none; margin-top:14px; border:1px solid var(--line); background:var(--bg); padding:12px; max-height:260px; overflow-y:auto; }',
    '#valo-shop-page .cm-picker.open{ display:block; }',
    '#valo-shop-page .cm-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(78px, 1fr)); gap:10px; }',
    '#valo-shop-page .cm-agent{ all:unset; box-sizing:border-box; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px; padding:8px 4px; border:1px solid transparent; text-align:center; transition:border-color .2s ease, background .2s ease; }',
    '#valo-shop-page .cm-agent:hover{ background:var(--surface); }',
    '#valo-shop-page .cm-agent.selected{ border-color:var(--red); background:var(--surface); }',
    '#valo-shop-page .cm-agent span{ font-size:12px; color:var(--muted); font-weight:700; }',
    '#valo-shop-page .cm-rate{ margin-top:18px; }',
    '#valo-shop-page .cm-rate .cm-label{ margin-bottom:4px; }',
    '#valo-shop-page .cm-star-pick{ display:flex; gap:4px; direction:ltr; justify-content:flex-start; }',
    '#valo-shop-page .cm-star-btn{ all:unset; cursor:pointer; font-size:34px; line-height:1; color:var(--muted-2); padding:2px 3px; transition:color .15s ease, transform .15s ease; }',
    '#valo-shop-page .cm-star-btn.on{ color:var(--gold); }',
    '#valo-shop-page .cm-star-btn:hover{ transform:scale(1.12); }',
    '#valo-shop-page .cm-star-btn[disabled]{ cursor:default; transform:none; }',
    '#valo-shop-page .cm-name-wrap{ display:none; margin-top:16px; }',
    '#valo-shop-page .cm-name-wrap.show{ display:block; }',
    '#valo-shop-page .cm-name-wrap .cm-label{ margin-bottom:6px; }',
    '#valo-shop-page .cm-input, #valo-shop-page .cm-text{ width:100%; background:var(--bg); border:1px solid var(--line); color:var(--text); font-family:inherit; font-size:15px; line-height:1.7; padding:10px 14px; border-radius:0; }',
    '#valo-shop-page .cm-input:focus, #valo-shop-page .cm-text:focus{ outline:none; border-color:var(--red); }',
    '#valo-shop-page .cm-text{ margin-top:16px; resize:vertical; min-height:92px; padding:12px 14px; }',
    '#valo-shop-page .cm-row{ display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-top:12px; }',
    '#valo-shop-page .cm-count{ color:var(--muted-2); font-size:13px; }',
    '#valo-shop-page .cm-msg{ flex:1; font-size:13.5px; color:var(--muted); min-height:1em; }',
    '#valo-shop-page .cm-msg.err{ color:var(--red); }',
    '#valo-shop-page .cm-msg.ok{ color:var(--ice); }',
    '#valo-shop-page .cm-send{ padding:12px 24px; }',
    '#valo-shop-page .cm-send[disabled]{ opacity:.55; cursor:default; }',
    '#valo-shop-page .cm-admin{ display:none; margin-top:20px; align-items:center; gap:12px; flex-wrap:wrap; font-size:13.5px; color:var(--muted); }',
    '#valo-shop-page .cm-admin.show{ display:flex; }',
    '#valo-shop-page .cm-admin button, #valo-shop-page .cm-act, #valo-shop-page .cm-cancel{ all:unset; box-sizing:border-box; cursor:pointer; color:var(--ice); font-weight:700; font-size:13px; border:1px solid var(--line); padding:5px 12px; }',
    '#valo-shop-page .cm-admin button:hover, #valo-shop-page .cm-act:hover, #valo-shop-page .cm-cancel:hover{ border-color:var(--ice); }',
    '#valo-shop-page .cm-act.del{ color:var(--red); }',
    '#valo-shop-page .cm-act.del:hover{ border-color:var(--red); }',
    '#valo-shop-page .cm-actions{ display:flex; gap:6px; flex-wrap:wrap; margin-inline-start:auto; align-self:flex-start; }',
    '#valo-shop-page .cm-list{ margin-top:28px; display:flex; flex-direction:column; gap:18px; }',
    '#valo-shop-page .cm-thread{ display:flex; flex-direction:column; gap:10px; }',
    '#valo-shop-page .cm-item{ display:flex; gap:14px; align-items:flex-start; background:var(--surface); border:1px solid var(--line); padding:16px; }',
    '#valo-shop-page .cm-reply{ margin-inline-start:44px; border-inline-start:2px solid var(--red); padding:12px 14px; }',
    '#valo-shop-page .cm-reply .cm-avatar{ width:34px; height:34px; font-size:17px; }',
    '#valo-shop-page .cm-body{ min-width:0; flex:1; }',
    '#valo-shop-page .cm-head{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:4px; }',
    '#valo-shop-page .cm-name{ font-weight:800; font-size:15px; }',
    '#valo-shop-page .cm-rating{ color:var(--gold); font-size:14px; letter-spacing:1px; direction:ltr; }',
    '#valo-shop-page .cm-badge{ background:var(--red); color:#0A0C0F; font-size:11px; font-weight:900; padding:0 8px; line-height:1.7; }',
    '#valo-shop-page .cm-time{ color:var(--muted-2); font-size:12.5px; }',
    '#valo-shop-page .cm-content{ color:var(--text); font-size:15px; line-height:1.8; margin:0; white-space:pre-wrap; overflow-wrap:anywhere; }',
    '#valo-shop-page .cm-replyform{ margin-inline-start:44px; display:flex; flex-direction:column; gap:8px; }',
    '#valo-shop-page .cm-replyform .cm-text{ margin-top:0; min-height:72px; }',
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
        '<p data-ar="قيّم التطبيق وسيب تعليقك أو سؤالك هنا. اختار أيجنت من فالورانت يمثلك، ومفيش تسجيل." data-en="Rate the app and leave a comment or question here. Pick a Valorant agent to represent you — no sign-up needed."></p>' +
      '</div>' +
      '<div class="cm-stats" id="cm-stats"></div>' +
      '<div class="cm-box">' +
        '<span class="cm-label" id="cm-pick-label"></span>' +
        '<button type="button" class="cm-agent-btn" id="cm-agent-btn" aria-expanded="false">' +
          '<span class="cm-avatar" id="cm-agent-avatar">🎮</span>' +
          '<span class="cm-agent-name" id="cm-agent-name"></span>' +
          '<span class="cm-chev">⌄</span>' +
        '</button>' +
        '<span class="cm-note" id="cm-note"></span>' +
        '<div class="cm-picker" id="cm-picker"><div class="cm-grid" id="cm-grid"></div></div>' +
        '<div class="cm-rate" id="cm-rate">' +
          '<span class="cm-label" id="cm-rate-label"></span>' +
          '<div class="cm-star-pick" id="cm-star-pick"></div>' +
          '<span class="cm-note" id="cm-rate-note"></span>' +
        '</div>' +
        '<div class="cm-name-wrap" id="cm-name-wrap">' +
          '<span class="cm-label" id="cm-name-label"></span>' +
          '<input type="text" class="cm-input" id="cm-name-input" maxlength="' + MAX_NAME + '">' +
        '</div>' +
        '<textarea class="cm-text" id="cm-text" maxlength="' + MAX_LEN + '" rows="3"></textarea>' +
        '<div class="cm-row">' +
          '<span class="cm-count" id="cm-count">0/' + MAX_LEN + '</span>' +
          '<span class="cm-msg" id="cm-msg"></span>' +
          '<button type="button" class="btn btn-primary cm-send" id="cm-send"></button>' +
        '</div>' +
      '</div>' +
      '<div class="cm-admin" id="cm-admin"></div>' +
      '<div class="cm-list" id="cm-list"></div>' +
    '</div>';
  root.insertBefore(section, footer);

  function $(id){ return document.getElementById(id); }
  var el = {
    stats: $('cm-stats'),
    pickLabel: $('cm-pick-label'), agentBtn: $('cm-agent-btn'), agentAvatar: $('cm-agent-avatar'),
    agentName: $('cm-agent-name'), note: $('cm-note'), picker: $('cm-picker'), grid: $('cm-grid'),
    rate: $('cm-rate'), rateLabel: $('cm-rate-label'), starPick: $('cm-star-pick'), rateNote: $('cm-rate-note'),
    nameWrap: $('cm-name-wrap'), nameLabel: $('cm-name-label'), nameInput: $('cm-name-input'),
    text: $('cm-text'), count: $('cm-count'), msg: $('cm-msg'), send: $('cm-send'),
    admin: $('cm-admin'), list: $('cm-list')
  };

  var agents = [];
  var agentsById = {};
  var selected = null;
  var selectedRating = 0;
  var lockedId = null;
  var profileRating = null;
  var profileLoaded = false;
  var authFailed = false;
  var currentUser = null;
  var isAdmin = false;
  var lastDocs = null;
  var repliesByParent = {};
  var stats = null;
  var statsTimer = null;
  var listState = 'loading';
  var busy = false;
  var fb = null;
  var replyOpenId = null;
  var replyDrafts = {};
  var pendingRender = false;

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

  // ---------- Notifications ----------
  // Sends a push to the owner's phone (via the free ntfy.sh service) when a visitor posts a comment.
  function notifyOwner(agentName, rating, text){
    try{
      var clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
      var stars = rating ? starsText(rating) + ' ' : '';
      var url = 'https://ntfy.sh/' + NTFY_TOPIC +
        '?title=' + encodeURIComponent('Valo Shop — تعليق جديد') +
        '&tags=speech_balloon' +
        '&click=' + encodeURIComponent(location.origin + location.pathname + '#admin');
      fetch(url, { method: 'POST', mode: 'no-cors', body: stars + agentName + ': ' + clean }).catch(function(){});
    }catch(e){}
  }

  // ---------- Helpers ----------
  function starsText(n){
    n = Math.max(0, Math.min(5, Math.round(n || 0)));
    return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
  }

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

  function fmtNum(n){
    try{ return Number(n).toLocaleString(t('locale')); }catch(e){ return String(n); }
  }

  function isReady(){ return !!currentUser && profileLoaded; }

  // ---------- Rating widget (the star picker in the form) ----------
  var starBtns = [];
  (function buildStarPicker(){
    for(var i = 1; i <= 5; i++){
      (function(n){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cm-star-btn';
        b.textContent = '★';
        b.setAttribute('aria-label', n + '/5');
        b.addEventListener('click', function(){
          if(isAdmin || lockedId){ return; }
          selectedRating = n;
          renderRating();
        });
        starBtns.push(b);
        el.starPick.appendChild(b);
      })(i);
    }
  })();

  function renderRating(){
    // Admin never rates. A returning visitor sees their locked rating (or nothing if their profile has none).
    var show = !isAdmin && (!lockedId || !!profileRating);
    el.rate.style.display = show ? 'block' : 'none';
    el.rateLabel.textContent = t('rateLabel');
    var val = lockedId ? (profileRating || 0) : selectedRating;
    starBtns.forEach(function(b, i){
      b.classList.toggle('on', i < val);
      b.disabled = !!lockedId;
    });
    el.rateNote.textContent = lockedId ? t('rateLocked') : t('rateUnlocked');
  }

  // ---------- Stats panel (average, distribution, counters) ----------
  function renderStats(){
    el.stats.innerHTML = '';
    var counts = stats ? stats.counts : [0, 0, 0, 0, 0];
    var total = counts.reduce(function(a, b){ return a + b; }, 0);
    var sum = counts.reduce(function(a, c, i){ return a + c * (i + 1); }, 0);
    var avg = total ? sum / total : 0;

    var left = document.createElement('div');
    left.className = 'cm-avg';
    var num = document.createElement('div');
    num.className = 'cm-avg-num';
    num.textContent = total ? avg.toFixed(1) : '—';
    var st = document.createElement('div');
    st.className = 'cm-avg-stars';
    st.textContent = starsText(avg);
    var sub = document.createElement('div');
    sub.className = 'cm-avg-sub';
    sub.textContent = total ? t('ratingsCount').replace('{n}', fmtNum(total)) : t('noRatings');
    left.appendChild(num);
    left.appendChild(st);
    left.appendChild(sub);
    if(stats){
      var cc = document.createElement('div');
      cc.className = 'cm-avg-sub';
      cc.textContent = t('commentsCount').replace('{n}', fmtNum(stats.comments));
      left.appendChild(cc);
    }

    var bars = document.createElement('div');
    bars.className = 'cm-bars';
    for(var n = 5; n >= 1; n--){
      var c = counts[n - 1];
      var row = document.createElement('div');
      row.className = 'cm-bar-row';
      var lab = document.createElement('span');
      lab.className = 'cm-bar-label';
      lab.textContent = n + '★';
      var track = document.createElement('div');
      track.className = 'cm-bar-track';
      var fill = document.createElement('div');
      fill.className = 'cm-bar-fill';
      fill.style.width = (total ? Math.round(c / total * 100) : 0) + '%';
      track.appendChild(fill);
      var cnt = document.createElement('span');
      cnt.className = 'cm-bar-count';
      cnt.textContent = fmtNum(c);
      row.appendChild(lab);
      row.appendChild(track);
      row.appendChild(cnt);
      bars.appendChild(row);
    }
    el.stats.appendChild(left);
    el.stats.appendChild(bars);
  }

  // Counts come from the server (one count query per star level + total comments), so they stay exact beyond the 50 shown comments.
  function refreshStats(){
    if(!fb){ return; }
    var jobs = [1, 2, 3, 4, 5].map(function(n){
      return fb.getCountFromServer(fb.query(fb.collection(fb.db, USERS), fb.where('rating', '==', n)))
        .then(function(s){ return s.data().count; });
    });
    jobs.push(fb.getCountFromServer(fb.collection(fb.db, COLLECTION)).then(function(s){ return s.data().count; }));
    Promise.all(jobs).then(function(r){
      stats = { counts: r.slice(0, 5), comments: r[5] };
      renderStats();
    }).catch(function(){});
  }
  function scheduleStats(){
    clearTimeout(statsTimer);
    statsTimer = setTimeout(refreshStats, 700);
  }

  function renderStatic(){
    el.pickLabel.textContent = t('pick');
    el.text.setAttribute('placeholder', t('placeholder'));
    el.nameLabel.textContent = t('nameLabel');
    el.nameInput.setAttribute('placeholder', t('namePlaceholder'));
    el.nameWrap.classList.toggle('show', isAdmin);
    if(busy){ el.send.textContent = t('sending'); }
    else if(!isReady() && !authFailed){ el.send.textContent = t('preparing'); }
    else { el.send.textContent = t('send'); }
    el.send.disabled = busy || (!isReady() && !authFailed);
    el.agentName.textContent = selected ? selected.displayName : t('pickHint');
    el.note.textContent = isAdmin ? t('adminNote') : (lockedId ? t('lockedNote') : t('unlockedNote'));
    renderRating();
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

  // Locked agent for regular visitors; admin can always switch agent and name.
  function syncIdentity(){
    if(isAdmin){
      if(!selected){
        try{
          var savedId = localStorage.getItem(LS_ADMIN_AGENT);
          if(savedId && agentsById[savedId]){ selected = agentsById[savedId]; }
        }catch(err){}
      }
    } else if(lockedId && agentsById[lockedId]){
      selected = agentsById[lockedId];
    }
    el.agentBtn.classList.toggle('locked', !isAdmin && !!lockedId);
    if(!isAdmin && lockedId){ togglePicker(false); }
    renderSelected();
    renderStatic();
  }

  function renderAdmin(){
    el.admin.innerHTML = '';
    var show = isAdmin || location.hash === '#admin';
    el.admin.classList.toggle('show', show);
    if(!show){ return; }
    if(isAdmin){
      var who = document.createElement('span');
      who.textContent = t('adminAs') + ((currentUser && currentUser.email) || '');
      var out = document.createElement('button');
      out.type = 'button';
      out.textContent = t('adminLogout');
      out.addEventListener('click', function(){
        if(fb){ fb.signOut(fb.auth).catch(function(){}); }
      });
      el.admin.appendChild(who);
      el.admin.appendChild(out);
    } else {
      var inn = document.createElement('button');
      inn.type = 'button';
      inn.textContent = t('adminLogin');
      inn.addEventListener('click', function(){
        if(!fb){ return; }
        fb.signInWithPopup(fb.auth, new fb.GoogleAuthProvider()).catch(function(){
          setMsg(t('adminFail'), 'err');
        });
      });
      el.admin.appendChild(inn);
    }
  }

  function deleteReply(id){
    if(!fb || !isAdmin){ return; }
    if(!window.confirm(t('delConfirm'))){ return; }
    fb.deleteDoc(fb.doc(fb.db, REPLIES, id)).catch(function(){ setMsg(t('delFail'), 'err'); });
  }

  function deleteComment(id){
    if(!fb || !isAdmin){ return; }
    if(!window.confirm(t('delConfirm'))){ return; }
    var jobs = (repliesByParent[id] || []).map(function(r){ return fb.deleteDoc(fb.doc(fb.db, REPLIES, r.id)); });
    Promise.all(jobs).then(function(){
      return fb.deleteDoc(fb.doc(fb.db, COLLECTION, id));
    }).catch(function(){
      setMsg(t('delFail'), 'err');
    });
  }

  function makeEntry(c, isReply){
    var agent = agentsById[c.agentId];
    var item = document.createElement('div');
    item.className = 'cm-item' + (isReply ? ' cm-reply' : '');
    item.appendChild(makeAvatar(agent));
    var body = document.createElement('div');
    body.className = 'cm-body';
    var head = document.createElement('div');
    head.className = 'cm-head';
    var name = document.createElement('span');
    name.className = 'cm-name';
    name.textContent = c.name || (agent ? agent.displayName : 'Agent');
    head.appendChild(name);
    if(c.admin){
      var badge = document.createElement('span');
      badge.className = 'cm-badge';
      badge.textContent = t('badge');
      head.appendChild(badge);
    }
    if(c.rating){
      var rt = document.createElement('span');
      rt.className = 'cm-rating';
      rt.textContent = starsText(c.rating);
      head.appendChild(rt);
    }
    var time = document.createElement('span');
    time.className = 'cm-time';
    time.textContent = formatTime(c.createdAt);
    head.appendChild(time);
    var p = document.createElement('p');
    p.className = 'cm-content';
    p.textContent = c.text;
    body.appendChild(head);
    body.appendChild(p);
    item.appendChild(body);
    if(isAdmin){
      var actions = document.createElement('div');
      actions.className = 'cm-actions';
      if(!isReply){
        var rb = document.createElement('button');
        rb.type = 'button';
        rb.className = 'cm-act';
        rb.textContent = t('reply');
        rb.addEventListener('click', function(){
          replyOpenId = (replyOpenId === c.id) ? null : c.id;
          renderList();
        });
        actions.appendChild(rb);
      }
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'cm-act del';
      del.textContent = t('del');
      del.addEventListener('click', function(){ isReply ? deleteReply(c.id) : deleteComment(c.id); });
      actions.appendChild(del);
      item.appendChild(actions);
    }
    return item;
  }

  function makeReplyForm(parentId){
    var form = document.createElement('div');
    form.className = 'cm-replyform';
    var ta = document.createElement('textarea');
    ta.className = 'cm-text';
    ta.maxLength = MAX_LEN;
    ta.rows = 2;
    ta.placeholder = t('replyPlaceholder');
    ta.value = replyDrafts[parentId] || '';
    ta.addEventListener('input', function(){ replyDrafts[parentId] = ta.value; });
    ta.addEventListener('blur', function(){
      if(pendingRender){ setTimeout(function(){ if(pendingRender){ pendingRender = false; renderList(); } }, 150); }
    });
    var row = document.createElement('div');
    row.className = 'cm-row';
    var msg = document.createElement('span');
    msg.className = 'cm-msg';
    var go = document.createElement('button');
    go.type = 'button';
    go.className = 'btn btn-primary cm-send';
    go.textContent = t('replySend');
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'cm-cancel';
    cancel.textContent = t('cancel');
    cancel.addEventListener('click', function(){ replyOpenId = null; renderList(); });
    go.addEventListener('click', function(){
      if(busy){ return; }
      var res = buildPayload(ta.value.trim(), parentId);
      if(res.err){
        msg.textContent = t(res.err);
        msg.className = 'cm-msg err';
        if(res.err === 'needAgent'){ togglePicker(true); }
        return;
      }
      busy = true;
      go.disabled = true;
      renderStatic();
      fb.addDoc(fb.collection(fb.db, REPLIES), res.data).then(function(){
        replyDrafts[parentId] = '';
        replyOpenId = null;
        busy = false;
        renderStatic();
        renderList();
      }).catch(function(){
        busy = false;
        go.disabled = false;
        renderStatic();
        msg.textContent = t('error');
        msg.className = 'cm-msg err';
      });
    });
    row.appendChild(msg);
    row.appendChild(cancel);
    row.appendChild(go);
    form.appendChild(ta);
    form.appendChild(row);
    return form;
  }

  function renderList(){
    pendingRender = false;
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
      var thread = document.createElement('div');
      thread.className = 'cm-thread';
      thread.appendChild(makeEntry(c, false));
      (repliesByParent[c.id] || []).forEach(function(r){
        thread.appendChild(makeEntry(r, true));
      });
      if(isAdmin && replyOpenId === c.id){
        thread.appendChild(makeReplyForm(c.id));
      }
      el.list.appendChild(thread);
    });
  }

  // Live updates should not wipe a reply the admin is typing.
  function renderListSafe(){
    var a = document.activeElement;
    if(replyOpenId && a && a.tagName === 'TEXTAREA' && el.list.contains(a)){
      pendingRender = true;
      return;
    }
    renderList();
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
        if(!isAdmin && lockedId){ return; }
        selected = a;
        if(isAdmin){ try{ localStorage.setItem(LS_ADMIN_AGENT, a.uuid); }catch(err){} }
        renderSelected();
        togglePicker(false);
      });
      el.grid.appendChild(b);
    });
    renderSelected();
  }

  function togglePicker(force){
    var open = typeof force === 'boolean' ? force : !el.picker.classList.contains('open');
    if(!isAdmin && lockedId){ open = false; }
    el.picker.classList.toggle('open', open);
    el.agentBtn.classList.toggle('open', open);
    el.agentBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  el.agentBtn.addEventListener('click', function(){ togglePicker(); });
  el.text.addEventListener('input', function(){
    el.count.textContent = el.text.value.length + '/' + MAX_LEN;
  });
  el.nameInput.addEventListener('input', function(){
    try{ localStorage.setItem(LS_ADMIN_NAME, el.nameInput.value); }catch(err){}
  });

  // ---------- Sending ----------
  // Builds the document to save, or an error key (looked up with t()).
  function buildPayload(text, parentId){
    if(authFailed || !fb || !currentUser){ return { err: 'error' }; }
    if(!isReady()){ return { err: 'preparing' }; }
    var agent = isAdmin ? selected : (lockedId ? agentsById[lockedId] : selected);
    if(!agent){ return { err: 'needAgent' }; }
    var rating = 0;
    if(!isAdmin){
      rating = lockedId ? (profileRating || 0) : selectedRating;
      if(!lockedId && !rating){ return { err: 'needRating' }; }
    }
    if(!text){ return { err: 'needText' }; }
    if(!isAdmin){
      if(/(https?:\/\/|www\.)/i.test(text)){ return { err: 'noLinks' }; }
      if(hasBadWord(text)){ return { err: 'badWords' }; }
      try{
        var last = Number(localStorage.getItem(LS_LAST)) || 0;
        if(Date.now() - last < COOLDOWN_MS){ return { err: 'wait' }; }
      }catch(err){}
    }
    var data = {
      agentId: agent.uuid,
      uid: currentUser.uid,
      text: text,
      createdAt: fb.serverTimestamp()
    };
    if(isAdmin){
      data.admin = true;
      var nm = el.nameInput.value.trim().slice(0, MAX_NAME);
      if(nm){ data.name = nm; }
    } else if(rating){
      data.rating = rating;
    }
    if(parentId){ data.parentId = parentId; }
    return { data: data, agent: agent, rating: rating };
  }

  function send(){
    if(busy){ return; }
    var res = buildPayload(el.text.value.trim(), null);
    if(res.err){
      if(res.err === 'preparing'){ return; }
      setMsg(t(res.err), 'err');
      if(res.err === 'needAgent'){ togglePicker(true); }
      return;
    }
    var agent = res.agent;
    if(!isAdmin && !lockedId){
      var q = t('confirmPick').replace('{n}', agent.displayName).replace('{r}', String(res.rating));
      if(!window.confirm(q)){ return; }
    }

    busy = true;
    renderStatic();
    setMsg('');

    var uid = currentUser.uid;
    var creatingProfile = !(isAdmin || lockedId);
    var ensureProfile = !creatingProfile
      ? Promise.resolve()
      : fb.setDoc(fb.doc(fb.db, USERS, uid), (function(){
          var p = { agentId: agent.uuid, createdAt: fb.serverTimestamp() };
          if(res.rating){ p.rating = res.rating; }
          return p;
        })()).then(function(){
          lockedId = agent.uuid;
          profileRating = res.rating || null;
          syncIdentity();
          scheduleStats();
        });

    ensureProfile.then(function(){
      return fb.addDoc(fb.collection(fb.db, COLLECTION), res.data);
    }).then(function(){
      var sentText = res.data.text;
      el.text.value = '';
      el.count.textContent = '0/' + MAX_LEN;
      if(!isAdmin){
        try{ localStorage.setItem(LS_LAST, String(Date.now())); }catch(err){}
        notifyOwner(agent.displayName, res.rating, sentText);
      }
      setMsg(t('sent'), 'ok');
    }).catch(function(){
      setMsg(t('error'), 'err');
    }).then(function(){
      busy = false;
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
        renderPicker();
        syncIdentity();
        renderList();
      })
      .catch(function(){});
  }

  function onUser(user){
    if(!user){
      fb.signInAnonymously(fb.auth).catch(function(){
        authFailed = true;
        renderStatic();
      });
      return;
    }
    currentUser = user;
    isAdmin = !user.isAnonymous;
    profileLoaded = false;
    lockedId = null;
    profileRating = null;
    if(isAdmin){
      try{ el.nameInput.value = localStorage.getItem(LS_ADMIN_NAME) || ''; }catch(err){}
      profileLoaded = true;
      syncIdentity();
      renderAdmin();
      renderList();
      return;
    }
    selected = null;
    renderStatic();
    renderAdmin();
    renderList();
    fb.getDoc(fb.doc(fb.db, USERS, user.uid)).then(function(snap){
      if(snap.exists()){
        var d = snap.data();
        lockedId = d.agentId || null;
        profileRating = d.rating || null;
      } else {
        lockedId = null;
        profileRating = null;
      }
      profileLoaded = true;
      syncIdentity();
    }).catch(function(){
      authFailed = true;
      renderStatic();
    });
  }

  function loadFirebase(){
    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    return Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-auth.js'),
      import(base + 'firebase-firestore.js')
    ]).then(function(mods){
      var app = mods[0].initializeApp(FIREBASE_CONFIG);
      var a = mods[1];
      var f = mods[2];
      fb = {
        db: f.getFirestore(app),
        auth: a.getAuth(app),
        collection: f.collection,
        doc: f.doc,
        query: f.query,
        where: f.where,
        getCountFromServer: f.getCountFromServer,
        addDoc: f.addDoc,
        setDoc: f.setDoc,
        getDoc: f.getDoc,
        deleteDoc: f.deleteDoc,
        serverTimestamp: f.serverTimestamp,
        signInAnonymously: a.signInAnonymously,
        signInWithPopup: a.signInWithPopup,
        GoogleAuthProvider: a.GoogleAuthProvider,
        signOut: a.signOut
      };

      var q = f.query(f.collection(fb.db, COLLECTION), f.orderBy('createdAt', 'desc'), f.limit(50));
      f.onSnapshot(q, function(snap){
        lastDocs = snap.docs.map(function(d){
          var data = d.data({ serverTimestamps: 'estimate' });
          return { id: d.id, agentId: data.agentId, name: data.name, admin: !!data.admin, rating: data.rating, text: data.text, createdAt: data.createdAt };
        });
        listState = 'ready';
        renderListSafe();
        scheduleStats();
      }, function(){
        listState = 'error';
        renderList();
      });

      var rq = f.query(f.collection(fb.db, REPLIES), f.orderBy('createdAt', 'asc'), f.limit(300));
      f.onSnapshot(rq, function(snap){
        var map = {};
        snap.docs.forEach(function(d){
          var data = d.data({ serverTimestamps: 'estimate' });
          if(!data.parentId){ return; }
          (map[data.parentId] = map[data.parentId] || []).push({
            id: d.id, agentId: data.agentId, name: data.name, admin: !!data.admin, text: data.text, createdAt: data.createdAt
          });
        });
        repliesByParent = map;
        renderListSafe();
      }, function(){});

      a.onAuthStateChanged(fb.auth, onUser);
      renderAdmin();
      refreshStats();
    });
  }

  var started = false;
  function start(){
    if(started){ return; }
    started = true;
    loadAgents();
    loadFirebase().catch(function(){
      listState = 'error';
      authFailed = true;
      renderList();
      renderStatic();
    });
  }

  renderStatic();
  renderStats();
  renderList();
  renderAdmin();
  window.addEventListener('hashchange', renderAdmin);

  // Re-apply dynamic text when the page language is switched (static text is handled by the page itself).
  if('MutationObserver' in window){
    new MutationObserver(function(){
      renderStatic();
      renderStats();
      renderList();
      renderAdmin();
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });
  }

  var lg = lang();
  section.querySelectorAll('[data-ar]').forEach(function(n){
    n.innerHTML = n.getAttribute('data-' + lg);
  });

  // Opening the page with #admin loads comments right away so the admin can sign in.
  if(location.hash === '#admin'){ start(); }

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
