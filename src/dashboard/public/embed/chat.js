// ═══════════════════════════════════════════════════
//   FREENZY.IO — Embeddable Chat Widget
//   Self-contained vanilla JS widget
// ═══════════════════════════════════════════════════
(function() {
  'use strict';

  // Read config from script tag data attributes
  var script = document.currentScript || document.querySelector('script[data-agent]');
  if (!script) return;

  // Inline escapeHtml for config sanitization (full function defined later)
  function _esc(text) { var d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
  function _sanitizeColor(c) {
    if (/^#[0-9a-fA-F]{3,8}$/.test(c)) return c;
    if (/^[a-zA-Z]{1,20}$/.test(c)) return c;
    if (/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(c)) return c;
    return '#5b6cf7';
  }

  var config = {
    agent: script.getAttribute('data-agent') || 'fz-repondeur',
    color: _sanitizeColor(script.getAttribute('data-color') || '#5b6cf7'),
    position: (script.getAttribute('data-position') === 'bottom-left') ? 'bottom-left' : 'bottom-right',
    welcome: script.getAttribute('data-welcome') || 'Bonjour ! Comment puis-je vous aider ?',
    title: script.getAttribute('data-title') || 'Assistant Freenzy',
    radius: Math.min(Math.max(parseInt(script.getAttribute('data-radius') || '16', 10) || 16, 0), 32),
    width: Math.min(Math.max(parseInt(script.getAttribute('data-width') || '380', 10) || 380, 280), 600),
    height: Math.min(Math.max(parseInt(script.getAttribute('data-height') || '520', 10) || 520, 300), 800),
  };

  var isOpen = false;
  var messages = [{ role: 'assistant', content: config.welcome }];

  // Create styles
  var style = document.createElement('style');
  style.textContent = [
    '#fz-widget-bubble{position:fixed;' + config.position.replace('-', ':16px;').replace('bottom', 'bottom:16') + 'px;z-index:999999;cursor:pointer;width:56px;height:56px;border-radius:50%;background:' + config.color + ';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px ' + config.color + '40;transition:transform 0.2s}',
    '#fz-widget-bubble:hover{transform:scale(1.1)}',
    '#fz-widget-bubble svg{width:28px;height:28px;fill:#fff}',
    '#fz-widget-container{position:fixed;' + config.position.replace('-', ':16px;').replace('bottom', 'bottom:80') + 'px;z-index:999999;width:' + config.width + 'px;height:' + config.height + 'px;border-radius:' + config.radius + 'px;overflow:hidden;background:#0a0a0f;border:1px solid rgba(255,255,255,0.12);box-shadow:0 8px 32px rgba(0,0,0,0.4);display:none;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
    '#fz-widget-container.open{display:flex;animation:fzSlideUp 0.3s ease}',
    '@keyframes fzSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
    '#fz-widget-header{padding:14px 16px;background:' + config.color + ';display:flex;align-items:center;gap:10px}',
    '#fz-widget-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}',
    '.fz-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;word-wrap:break-word}',
    '.fz-msg-bot{background:rgba(255,255,255,0.06);color:#fff;align-self:flex-start;border-bottom-left-radius:4px}',
    '.fz-msg-user{background:' + config.color + ';color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
    '#fz-widget-input{padding:10px 12px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px}',
    '#fz-widget-input input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:#fff;font-size:13px;outline:none}',
    '#fz-widget-input button{width:36px;height:36px;border-radius:8px;border:none;background:' + config.color + ';cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '#fz-widget-input button svg{width:16px;height:16px;fill:#fff}',
  ].join('\n');
  document.head.appendChild(style);

  // Create bubble
  var bubble = document.createElement('div');
  bubble.id = 'fz-widget-bubble';
  bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
  bubble.onclick = function() { toggleWidget(); };
  document.body.appendChild(bubble);

  // Create container
  var container = document.createElement('div');
  container.id = 'fz-widget-container';
  container.innerHTML = [
    '<div id="fz-widget-header">',
    '  <svg width="22" height="22" fill="#fff" viewBox="0 0 24 24"><path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v1h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1H3a1 1 0 01-1-1v-3a1 1 0 011-1h1v-1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM9 14a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2z"/></svg>',
    '  <div style="flex:1">',
    '    <div style="font-size:13px;font-weight:700;color:#fff">' + _esc(config.title) + '</div>',
    '    <div style="font-size:10px;color:rgba(255,255,255,0.7)">En ligne</div>',
    '  </div>',
    '  <div style="cursor:pointer;padding:4px" onclick="document.getElementById(\'fz-widget-container\').classList.remove(\'open\');document.getElementById(\'fz-widget-bubble\').style.display=\'flex\'">',
    '    <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    '  </div>',
    '</div>',
    '<div id="fz-widget-messages"></div>',
    '<div id="fz-widget-input">',
    '  <input type="text" placeholder="Ecrivez un message..." id="fz-widget-text" />',
    '  <button id="fz-widget-send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>',
    '</div>',
  ].join('\n');
  document.body.appendChild(container);

  // Render messages
  function renderMessages() {
    var msgContainer = document.getElementById('fz-widget-messages');
    msgContainer.innerHTML = messages.map(function(m) {
      return '<div class="fz-msg fz-msg-' + (m.role === 'user' ? 'user' : 'bot') + '">' + escapeHtml(m.content) + '</div>';
    }).join('');
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function sanitizeColor(color) {
    // Only allow valid hex colors and named colors
    if (/^#[0-9a-fA-F]{3,8}$/.test(color)) return color;
    if (/^[a-zA-Z]{1,20}$/.test(color)) return color;
    if (/^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/.test(color)) return color;
    return '#5b6cf7'; // fallback
  }

  // Toggle
  function toggleWidget() {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add('open');
      bubble.style.display = 'none';
      renderMessages();
      setTimeout(function() { document.getElementById('fz-widget-text').focus(); }, 100);
    } else {
      container.classList.remove('open');
      bubble.style.display = 'flex';
    }
  }

  // Send message
  function sendMessage() {
    var input = document.getElementById('fz-widget-text');
    var text = input.value.trim();
    if (!text) return;

    messages.push({ role: 'user', content: text });
    input.value = '';
    renderMessages();

    // Simulate response (in production, would call API)
    setTimeout(function() {
      messages.push({
        role: 'assistant',
        content: 'Merci pour votre message ! Un agent Freenzy vous répondra sous peu. En attendant, n\'hésitez pas à poser d\'autres questions.',
      });
      renderMessages();
    }, 800);
  }

  // Events
  document.getElementById('fz-widget-send').onclick = sendMessage;
  document.getElementById('fz-widget-text').onkeypress = function(e) {
    if (e.key === 'Enter') sendMessage();
  };

  // Initial render
  renderMessages();
})();
