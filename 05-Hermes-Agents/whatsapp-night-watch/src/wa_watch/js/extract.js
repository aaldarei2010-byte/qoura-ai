// Read-only extractors for WhatsApp Web (English UI).
// Evaluated through Playwright as `page.evaluate(SOURCE, {op: ...})`.
// Nothing is stored on `window`, nothing is clicked or changed here:
// these functions only *look* at what is already on the screen.
(arg) => {
  const op = (arg && arg.op) || 'state';

  const TIME_RE = /^(?:\d{1,2}:\d{2}(?:\s?[AaPp]\.?\s?[Mm]\.?)?|Yesterday|Today|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|\d{1,4}[\/.\-]\d{1,2}[\/.\-]\d{1,4})$/;
  const UNREAD_RE = /(\d+)\s+unread/i;
  const STATUS_LABEL_RE = /^\s*(read|delivered|sent|pending)\s*$/i;
  const STATUS_ICON_RE = /(^|[-_])(dbl)?check|status-time|msg-time/i;

  const clean = (s) => (s || '')
    .replace(/[‎‏‪-‮⁦-⁩]/g, '')
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const textOf = (el) => clean(el ? (el.innerText || el.textContent || '') : '');
  const linesOf = (el) => (el ? (el.innerText || el.textContent || '') : '')
    .split('\n').map(clean).filter(Boolean);
  const pane = () => document.querySelector('#pane-side');

  function state() {
    if (pane()) return 'ready';
    if (document.querySelector('canvas[aria-label*="scan" i], [data-ref] canvas')) return 'qr';
    const t = textOf(document.body).slice(0, 4000).toLowerCase();
    if (/scan (the )?qr code|use whatsapp on your computer|log in with phone number|link with phone number|steps to log in|enter (the )?code on (your )?phone/.test(t)) return 'qr';
    if (/whatsapp works with|update (google )?chrome|browser (is )?not supported/.test(t)) return 'unsupported';
    return 'loading';
  }

  function rowElements() {
    const root = pane();
    if (!root) return [];
    let rows = Array.from(root.querySelectorAll('[role="listitem"], [role="row"]'))
      .filter((r) => r.querySelector('span[title]'));
    // keep the outermost element of each row only
    rows = rows.filter((r) => !rows.some((o) => o !== r && o.contains(r)));
    return rows;
  }

  function badge(row) {
    let unread = 0;
    let marked = false;
    for (const el of row.querySelectorAll('[aria-label]')) {
      const label = clean(el.getAttribute('aria-label'));
      const m = label.match(UNREAD_RE);
      if (m) { unread = parseInt(m[1], 10) || 0; break; }
      if (/^unread$|marked as unread|unread chat/i.test(label)) marked = true;
    }
    if (!unread) {
      // Fallback: a leaf holding only a number, outside any titled span (names/previews carry titles).
      const leaves = Array.from(row.querySelectorAll('span, div')).filter((el) =>
        el.childElementCount === 0 && /^\d{1,4}$/.test(textOf(el)) && !el.closest('[title]'));
      if (leaves.length) unread = parseInt(textOf(leaves[leaves.length - 1]), 10) || 0;
    }
    return { unread, marked: marked && !unread };
  }

  function parseRow(row, root) {
    const titled = Array.from(row.querySelectorAll('span[title]'))
      .map((s) => clean(s.getAttribute('title'))).filter(Boolean);
    const lines = linesOf(row);
    const name = titled[0] || lines[0] || '';
    const time = lines.find((l, i) => i > 0 && TIME_RE.test(l)) || '';
    const { unread, marked } = badge(row);
    const rest = lines.filter((l, i) =>
      !(i === 0 && l === name) && l !== time && !(unread && l === String(unread)));
    let preview = clean(rest.join(' ').replace(/\s+:\s*/g, ': '));
    const titledPreview = titled.length > 1 ? titled[titled.length - 1] : '';
    if (titledPreview && titledPreview.length > preview.length) preview = titledPreview;

    let fromMe = /^(You|أنت)\s*:/.test(preview);
    for (const el of row.querySelectorAll('[data-icon], [aria-label]')) {
      const icon = el.getAttribute('data-icon') || '';
      const label = el.getAttribute('aria-label') || '';
      if ((icon && STATUS_ICON_RE.test(icon)) || STATUS_LABEL_RE.test(label)) { fromMe = true; break; }
    }
    const r = row.getBoundingClientRect();
    const pr = root.getBoundingClientRect();
    return {
      name,
      time,
      preview: preview.slice(0, 500),
      unread,
      marked,
      muted: !!row.querySelector('[data-icon*="muted" i], [aria-label*="muted" i]'),
      pinned: !!row.querySelector('[data-icon*="pinned" i], [aria-label*="pinned" i]'),
      groupIcon: !!row.querySelector('[data-icon*="default-group" i], [data-icon*="community" i]'),
      fromMe,
      y: Math.round(r.top - pr.top + root.scrollTop),
      visible: r.bottom > pr.top && r.top < pr.bottom,
    };
  }

  function rows() {
    const root = pane();
    if (!root) return [];
    return rowElements().map((r) => parseRow(r, root)).filter((x) => x.name);
  }

  function scrollInfo() {
    const p = pane();
    if (!p) return null;
    const b = p.getBoundingClientRect();
    return {
      top: p.scrollTop,
      height: p.clientHeight,
      total: p.scrollHeight,
      atEnd: p.scrollTop + p.clientHeight >= p.scrollHeight - 4,
      atTop: p.scrollTop <= 2,
      box: { x: b.left, y: b.top, width: b.width, height: b.height },
    };
  }

  function messages(limit) {
    const main = document.querySelector('#main');
    if (!main) return [];
    const bubbles = Array.from(main.querySelectorAll('div.message-in, div.message-out'));
    return bubbles.slice(-limit).map((b) => {
      const pre = b.querySelector('[data-pre-plain-text]');
      const meta = pre ? clean(pre.getAttribute('data-pre-plain-text')) : '';
      const body = b.querySelector('span.selectable-text, .copyable-text span[dir]');
      const text = body ? textOf(body) : '';
      let kind = 'text';
      if (!text) {
        if (b.querySelector('[data-icon*="audio" i], [data-icon*="ptt" i], audio')) kind = 'voice';
        else if (b.querySelector('[data-icon*="document" i], [data-icon*="doc-" i]')) kind = 'document';
        else if (b.querySelector('[data-icon*="sticker" i]')) kind = 'sticker';
        else if (b.querySelector('img, video, [data-icon*="media" i], [data-icon*="video" i]')) kind = 'media';
        else kind = 'other';
      }
      return {
        direction: b.classList.contains('message-out') ? 'out' : 'in',
        meta,
        text: text.slice(0, 1500),
        kind,
      };
    });
  }

  function openChatTitle() {
    const header = document.querySelector('#main header');
    if (!header) return null;
    const t = header.querySelector('span[title]') || header.querySelector('span[dir="auto"]');
    return t ? clean(t.getAttribute('title') || textOf(t)) : (linesOf(header)[0] || '');
  }

  function linkCode() {
    const holder = document.querySelector('[data-link-code]');
    if (holder) return clean(holder.getAttribute('data-link-code')).replace(/,/g, '');
    return null;
  }

  // Structure-only diagnostics (counts, never content) to spot WhatsApp UI changes.
  function diag() {
    const side = document.querySelector('#side');
    const labels = side ? Array.from(side.querySelectorAll('button, [role="tab"]'))
      .map((b) => clean(b.getAttribute('aria-label') || b.innerText || '')).filter((s) => s && s.length < 20) : [];
    return {
      state: state(),
      side: !!side,
      paneSide: !!pane(),
      rowElements: rowElements().length,
      listitems: document.querySelectorAll('#pane-side [role="listitem"]').length,
      gridRows: document.querySelectorAll('#pane-side [role="row"]').length,
      titledSpans: document.querySelectorAll('#pane-side span[title]').length,
      unreadBadges: document.querySelectorAll('#pane-side [aria-label*="unread" i]').length,
      filterButtons: labels.filter((s) => /^(all|unread|favou?rites|groups)$/i.test(s)),
      main: !!document.querySelector('#main'),
    };
  }

  switch (op) {
    case 'diag': return diag();
    case 'state': return state();
    case 'rows': return rows();
    case 'scrollInfo': return scrollInfo();
    case 'messages': return messages(Math.max(1, (arg && arg.limit) || 12));
    case 'openChatTitle': return openChatTitle();
    case 'linkCode': return linkCode();
    default: return null;
  }
}
