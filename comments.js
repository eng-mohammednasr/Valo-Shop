(function(){
  var root = document.getElementById('valo-shop-page');
  if(!root) return;
  var footer = root.querySelector('footer');
  if(!footer) return;

  var css = [
    '#valo-shop-page #comments{ background:var(--bg-2); border-top:1px solid var(--line); }',
    '#valo-shop-page .comments-box{ background:var(--surface); border:1px solid var(--line); padding:24px; min-height:160px; }',
    '#valo-shop-page .comments-box .utterances{ max-width:100%; }',
    '#valo-shop-page .comments-note{ color:var(--muted-2); font-size:13.5px; margin-top:14px; }'
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
        '<p data-ar="سيب تعليقك أو سؤالك هنا. التعليق بيتم بحساب GitHub." data-en="Leave a comment or question here. Commenting requires a GitHub account."></p>' +
      '</div>' +
      '<div class="comments-box" id="valo-comments-box"></div>' +
    '</div>';
  root.insertBefore(section, footer);

  var lang = root.getAttribute('lang') === 'en' ? 'en' : 'ar';
  section.querySelectorAll('[data-ar]').forEach(function(el){
    el.innerHTML = el.getAttribute('data-' + lang);
  });

  var box = document.getElementById('valo-comments-box');
  var loaded = false;

  function loadComments(){
    if(loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = 'https://utteranc.es/client.js';
    s.setAttribute('repo', 'eng-mohammednasr/Valo-Shop');
    s.setAttribute('issue-term', 'pathname');
    s.setAttribute('label', 'comments');
    s.setAttribute('theme', 'github-dark');
    s.crossOrigin = 'anonymous';
    s.async = true;
    box.appendChild(s);
  }

  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          loadComments();
          io.disconnect();
        }
      });
    }, { rootMargin: '300px' });
    io.observe(section);
  } else {
    loadComments();
  }
})();
