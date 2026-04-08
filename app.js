/* ===== TITT — Tibetan Interlinear Translation Tool ===== */
/* Version A */

(function () {
  'use strict';

  // ───────────────────────────────────────────────
  // Configuration — field definitions
  // ───────────────────────────────────────────────
  // Each entry drives: block HTML, SHOC buttons, output buttons.
  // To add a language later, add an entry here and the rest follows.
  const FIELDS = [
    { key: 'english',          label: 'English',          cssClass: 'english-dropdown',          rtl: false, alwaysOn: true  },
    { key: 'hebrew',           label: 'Hebrew',           cssClass: 'hebrew-dropdown',           rtl: true,  alwaysOn: false },
    { key: 'russian',          label: 'Russian',          cssClass: 'russian-dropdown',          rtl: false, alwaysOn: false },
    { key: 'correspondences',  label: 'Correspondences',  cssClass: 'correspondences-dropdown',  rtl: false, alwaysOn: true  },
    { key: 'notes',            label: 'Notes',            cssClass: 'notes-dropdown',            rtl: false, alwaysOn: true  },
  ];

  // Track which dropdowns should be open when new blocks are created
  const openState = {};
  FIELDS.forEach(f => { openState[f.key] = ''; });

  // ───────────────────────────────────────────────
  // Block HTML template
  // ───────────────────────────────────────────────
  function blockHTML(tibetanContent) {
    const tib = tibetanContent || 'Add Tibetan text';
    let html = '<div class="block">';
    html += '<div class="source-wrapper">';
    html += '<p class="tibetan" contenteditable>' + tib + '</p>';
    html += '</div>';

    for (const f of FIELDS) {
      const openAttr = openState[f.key] ? ' open' : '';
      const dirAttr = f.rtl ? ' dir="rtl"' : '';
      const placeholder = 'Add ' + f.label.toLowerCase();
      html += '<details class="' + f.cssClass + '"' + openAttr + '>';
      html += '<summary class="field-name">' + f.label + '</summary>';
      html += '<p class="' + f.key + '" contenteditable' + dirAttr + '>' + placeholder + '</p>';
      html += '</details>';
    }

    html += '<div class="sidebar">';
    html += '<button class="up" title="Move this block up">&and;</button>';
    html += '<button class="delete" title="Delete this block">&minus;</button>';
    html += '<button class="insert" title="Insert new block below">&#43;</button>';
    html += '<button class="down" title="Move this block down">&or;</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ───────────────────────────────────────────────
  // DOM references
  // ───────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const body = document.body;

  // ───────────────────────────────────────────────
  // New Block / Save
  // ───────────────────────────────────────────────
  $('#newBlock').addEventListener('click', () => {
    $('#end-marker').insertAdjacentHTML('beforebegin', blockHTML());
  });

  $('#savePage').addEventListener('click', () => {
    // Build a self-contained HTML file for saving
    const data = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const a = document.createElement('a');
    a.setAttribute('download', 'titt-document.html');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    a.click();
  });

  // ───────────────────────────────────────────────
  // Sidebar: delete, insert, move (event delegation)
  // ───────────────────────────────────────────────
  body.addEventListener('click', (e) => {
    const t = e.target;
    if (!t.matches('.sidebar button')) return;
    const block = t.closest('.block');
    if (!block) return;

    if (t.classList.contains('delete')) {
      const blocks = $$('.block');
      const idx = Array.from(blocks).indexOf(block) + 1;
      if (confirm('Delete block ' + idx + '?\nThis cannot be undone.')) {
        block.remove();
      }
    }

    if (t.classList.contains('insert')) {
      block.insertAdjacentHTML('afterend', blockHTML());
    }

    if (t.classList.contains('up')) {
      const prev = block.previousElementSibling;
      if (!prev || !prev.classList.contains('block')) {
        alert('Cannot move this block higher.');
      } else {
        prev.insertAdjacentHTML('beforebegin', block.outerHTML);
        block.remove();
      }
    }

    if (t.classList.contains('down')) {
      const next = block.nextElementSibling;
      if (!next || !next.classList.contains('block')) {
        alert('Cannot move this block lower.');
      } else {
        next.insertAdjacentHTML('afterend', block.outerHTML);
        block.remove();
      }
    }
  });

  // ───────────────────────────────────────────────
  // Mass delete
  // ───────────────────────────────────────────────
  $('#massDeleteBtn').addEventListener('click', () => {
    const blocks = $$('.block');
    const min = parseInt($('#rangeMin').value, 10);
    const max = parseInt($('#rangeMax').value, 10);
    if (blocks.length === 0) return alert('No blocks to delete.');
    if (isNaN(min) || min < 1) return alert('First block # must be a number >= 1.');
    if (isNaN(max) || max > blocks.length) return alert('Last block # must be <= ' + blocks.length + '.');
    if (max < min) return alert('Last block # must be >= first block #.');
    const count = max - min + 1;
    if (!confirm('Delete ' + count + ' block(s)?\nThis cannot be undone.')) return;
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (i + 1 >= min && i + 1 <= max) blocks[i].remove();
    }
    alert(count + ' block(s) deleted.');
  });

  // ───────────────────────────────────────────────
  // SHOC — Show / Hide / Open / Close
  // ───────────────────────────────────────────────
  // Helper: find a CSS rule by selector in the first stylesheet
  function findCSSRule(selector) {
    const rules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].selectorText === selector) return rules[i];
    }
    return null;
  }

  function showField(cssClass) {
    const rule = findCSSRule('.' + cssClass);
    if (rule) rule.style.display = 'block';
  }
  function hideField(cssClass) {
    const rule = findCSSRule('.' + cssClass);
    if (rule) rule.style.display = 'none';
  }
  function openField(cssClass, key) {
    const els = document.getElementsByClassName(cssClass);
    for (let i = 0; i < els.length; i++) els[i].setAttribute('open', '');
    if (key) openState[key] = 'open';
  }
  function closeField(cssClass, key) {
    const els = document.getElementsByClassName(cssClass);
    for (let i = 0; i < els.length; i++) els[i].removeAttribute('open');
    if (key) openState[key] = '';
  }

  // Wire individual SHOC buttons
  FIELDS.forEach(f => {
    const capKey = f.key.charAt(0).toUpperCase() + f.key.slice(1);
    const showBtn = $(`#show${capKey}`);
    const hideBtn = $(`#hide${capKey}`);
    const openBtn = $(`#open${capKey}`);
    const closeBtn = $(`#close${capKey}`);
    if (showBtn) showBtn.addEventListener('click', () => showField(f.cssClass));
    if (hideBtn) hideBtn.addEventListener('click', () => hideField(f.cssClass));
    if (openBtn) openBtn.addEventListener('click', () => openField(f.cssClass, f.key));
    if (closeBtn) closeBtn.addEventListener('click', () => closeField(f.cssClass, f.key));
  });

  // All buttons
  $('#showAll').addEventListener('click', () => FIELDS.forEach(f => showField(f.cssClass)));
  $('#hideAll').addEventListener('click', () => FIELDS.forEach(f => hideField(f.cssClass)));
  $('#openAll').addEventListener('click', () => {
    FIELDS.forEach(f => openField(f.cssClass, f.key));
  });
  $('#closeAll').addEventListener('click', () => {
    FIELDS.forEach(f => closeField(f.cssClass, f.key));
  });

  // Sidebar show/hide
  $('#showSidebar').addEventListener('click', () => {
    const rule = findCSSRule('.sidebar');
    if (rule) rule.style.visibility = 'visible';
  });
  $('#hideSidebar').addEventListener('click', () => {
    const rule = findCSSRule('.sidebar');
    if (rule) rule.style.visibility = 'hidden';
  });

  // Field names show/hide
  $('#showFieldNames').addEventListener('click', () => {
    const rule = findCSSRule('summary.field-name');
    if (rule) rule.style.display = 'list-item';
  });
  $('#hideFieldNames').addEventListener('click', () => {
    const rule = findCSSRule('summary.field-name');
    if (rule) rule.style.display = 'none';
  });

  // ───────────────────────────────────────────────
  // Language Toggles
  // ───────────────────────────────────────────────
  function bindLangToggle(checkboxId, cssClass) {
    const cb = $(checkboxId);
    if (!cb) return;
    cb.addEventListener('change', () => {
      if (cb.checked) {
        showField(cssClass);
      } else {
        hideField(cssClass);
      }
    });
    // Apply initial state
    if (!cb.checked) hideField(cssClass);
  }
  bindLangToggle('#toggleHebrew', 'hebrew-dropdown');
  bindLangToggle('#toggleRussian', 'russian-dropdown');

  // ───────────────────────────────────────────────
  // Import Tibetan Text
  // ───────────────────────────────────────────────
  $('#importTibetanBtn').addEventListener('click', () => {
    const raw = $('#importBox').value;
    if (!raw.trim()) return alert('Paste some text into the import box first.');

    let text = raw;
    // Handle Wylie line-break markers
    text = text.replaceAll('@#/_/', '!YINGO!');
    // Remove hard newlines
    text = text.replaceAll('\n', '');
    // Uchen processing
    text = text.replaceAll('༄༅། །', '');
    text = text.replaceAll('༄༅༅། །', '!YINGO2!');
    text = text.replaceAll('། །', '!DBL!');
    text = text.replaceAll('། ', '!SHD!');
    text = text.replaceAll('!DBL!', '། །<br>');
    text = text.replaceAll('!SHD!', '། ');
    text = text.replaceAll('!YINGO2!', '༄༅༅། །');
    text = text.replaceAll('་ ', '་');
    // Wylie processing
    text = text.replaceAll('/_/', '&sol;&lowbar;&sol;<br>');
    text = text.replaceAll('/', '&sol;');
    text = text.replaceAll('_', '&lowbar;');
    text = text.replaceAll('*', '&ast;');
    text = text.replaceAll('!YINGO!', '@#/_/');

    const lines = text.split('<br>').filter(l => l.trim());
    if (lines.length < 1) return alert('Could not detect any lines. Check the text format.');
    if (!confirm('This will add ' + lines.length + ' block(s) to the work area.\nContinue?')) return;

    for (const line of lines) {
      $('#end-marker').insertAdjacentHTML('beforebegin', blockHTML(line));
    }
    alert(lines.length + ' block(s) added.');
  });

  // ───────────────────────────────────────────────
  // Output — helpers
  // ───────────────────────────────────────────────
  function getFieldContents(className) {
    const els = document.getElementsByClassName(className);
    const arr = [];
    for (let i = 0; i < els.length; i++) arr.push(els[i].innerHTML);
    return arr;
  }

  function setOutput(html) {
    $('#displayBox').innerHTML = html;
  }

  // ───────────────────────────────────────────────
  // Output — block-by-block
  // ───────────────────────────────────────────────
  $('#outTibetanBlock').addEventListener('click', () => {
    setOutput(getFieldContents('tibetan').join('<br>'));
  });

  $('#outEnglishBlock').addEventListener('click', () => {
    setOutput(getFieldContents('english').join('<br>'));
  });

  $('#outHebrewBlock').addEventListener('click', () => {
    const items = getFieldContents('hebrew');
    setOutput('<div dir="rtl">' + items.join('<br>') + '</div>');
  });

  $('#outRussianBlock').addEventListener('click', () => {
    setOutput(getFieldContents('russian').join('<br>'));
  });

  $('#outCorrespondencesBlock').addEventListener('click', () => {
    const items = getFieldContents('correspondences');
    let out = '';
    for (const item of items) {
      out += item + '<br>';
    }
    out = out.replaceAll('<br><br>', '<br>');
    setOutput(out);
  });

  // Interlinear combos
  $('#outTibEnBlock').addEventListener('click', () => {
    const tib = getFieldContents('tibetan');
    const en = getFieldContents('english');
    let out = '';
    for (let i = 0; i < tib.length; i++) {
      out += '<p>' + (tib[i] || '') + '<br>' + (en[i] || '') + '</p>';
    }
    setOutput(out);
  });

  $('#outTibHeBlock').addEventListener('click', () => {
    const tib = getFieldContents('tibetan');
    const he = getFieldContents('hebrew');
    let out = '';
    for (let i = 0; i < tib.length; i++) {
      out += '<p>' + (tib[i] || '') + '<br><span dir="rtl">' + (he[i] || '') + '</span></p>';
    }
    setOutput(out);
  });

  $('#outTibRuBlock').addEventListener('click', () => {
    const tib = getFieldContents('tibetan');
    const ru = getFieldContents('russian');
    let out = '';
    for (let i = 0; i < tib.length; i++) {
      out += '<p>' + (tib[i] || '') + '<br>' + (ru[i] || '') + '</p>';
    }
    setOutput(out);
  });

  $('#outAllBlock').addEventListener('click', () => {
    const tib = getFieldContents('tibetan');
    const en = getFieldContents('english');
    const he = getFieldContents('hebrew');
    const ru = getFieldContents('russian');
    let out = '';
    for (let i = 0; i < tib.length; i++) {
      out += '<p>' + (tib[i] || '');
      if (en[i]) out += '<br>' + en[i];
      if (he[i]) out += '<br><span dir="rtl">' + he[i] + '</span>';
      if (ru[i]) out += '<br>' + ru[i];
      out += '</p>';
    }
    setOutput(out);
  });

  // ───────────────────────────────────────────────
  // Output — continuous
  // ───────────────────────────────────────────────
  $('#outTibetanCont').addEventListener('click', () => {
    let out = getFieldContents('tibetan').join(' ');
    out = out.replaceAll('། ། ', '། །');
    out = out.replaceAll('/_/ ', '/_/');
    setOutput(out);
  });

  $('#outEnglishCont').addEventListener('click', () => {
    let out = getFieldContents('english').map(s => s.replaceAll('<br>', ' ')).join(' ');
    setOutput(out);
  });

  $('#outHebrewCont').addEventListener('click', () => {
    let out = getFieldContents('hebrew').map(s => s.replaceAll('<br>', ' ')).join(' ');
    setOutput('<div dir="rtl">' + out + '</div>');
  });

  $('#outRussianCont').addEventListener('click', () => {
    let out = getFieldContents('russian').map(s => s.replaceAll('<br>', ' ')).join(' ');
    setOutput(out);
  });

  // ───────────────────────────────────────────────
  // Output — correspondence charts
  // ───────────────────────────────────────────────
  function buildCorrespondenceTable(colSeparator, entityEncode) {
    const items = getFieldContents('correspondences');
    let flat = '';
    for (const item of items) {
      flat += item + '<br>';
    }
    flat = flat.replaceAll('<br><br>', '<br>');

    if (entityEncode) {
      flat = flat.replaceAll(entityEncode.from, entityEncode.to);
    }

    const sep = entityEncode ? entityEncode.to : colSeparator;
    let table = '<table><tr><td>';
    table += flat.replaceAll('<br>', '</td></tr><tr><td>');
    table = table.replaceAll(sep, '</td><td>');
    table += '</td></tr></table>';
    table = table.replaceAll('<td> ', '<td>');
    table = table.replaceAll(' </td>', '</td>');
    table = table.replaceAll('<td></td>', '');
    table = table.replaceAll('<tr></tr>', '');
    setOutput(table);
  }

  $('#corrComma').addEventListener('click', () => buildCorrespondenceTable(','));
  $('#corrEquals').addEventListener('click', () => buildCorrespondenceTable('='));
  $('#corrSlash').addEventListener('click', () => buildCorrespondenceTable('/', { from: '/', to: '&sol;' }));
  $('#corrHyphen').addEventListener('click', () => buildCorrespondenceTable('-', { from: '-', to: '&hyphen;' }));
  $('#corrDblSpace').addEventListener('click', () => {
    // Special case: double space
    const items = getFieldContents('correspondences');
    let flat = '';
    for (const item of items) {
      flat += item + '<br>';
    }
    flat = flat.replaceAll('<br><br>', '<br>');
    flat = flat.replaceAll(' ', '&nbsp;');

    let table = '<table><tr><td>';
    table += flat.replaceAll('<br>', '</td></tr><tr><td>');
    table = table.replaceAll('&nbsp;&nbsp;', '</td><td>');
    table += '</td></tr></table>';
    table = table.replaceAll('<td> ', '<td>');
    table = table.replaceAll(' </td>', '</td>');
    table = table.replaceAll('<td></td>', '');
    table = table.replaceAll('<tr></tr>', '');
    setOutput(table);
  });

  // ───────────────────────────────────────────────
  // Output — from input box (bottom)
  // ───────────────────────────────────────────────
  $('#outInputLineByLine').addEventListener('click', () => {
    const raw = $('#outputInputBox').value;
    let text = raw;
    // Remove newlines, process Uchen double-shad breaks
    text = text.replaceAll('\n', '');
    text = text.replaceAll('༄༅། །', '!Y2!');
    text = text.replaceAll('༄༅༅། །', '!Y3!');
    text = text.replaceAll('། །', '!DBL!');
    text = text.replaceAll('། ', '!SHD!');
    text = text.replaceAll('!DBL!', '། །<br>');
    text = text.replaceAll('!SHD!', '། ');
    text = text.replaceAll('!Y2!', '༄༅། །');
    text = text.replaceAll('!Y3!', '༄༅༅། །');
    text = text.replaceAll('་ ', '་');
    // Wylie
    text = text.replaceAll('@#/_/', '!Y2!');
    text = text.replaceAll('@##/_/', '!Y3!');
    text = text.replaceAll('/_/', '!DBL!');
    text = text.replaceAll('!DBL!', '/_/<br>');
    text = text.replaceAll('!Y2!', '@#/_/');
    text = text.replaceAll('!Y3!', '@##/_/');
    setOutput(text);
  });

  $('#outInputContinuous').addEventListener('click', () => {
    let text = $('#outputInputBox').value;
    text = text.replaceAll('\n', ' ');
    text = text.replaceAll('  ', ' ');
    setOutput(text);
  });

  $('#outInputRemoveSpaces').addEventListener('click', () => {
    let text = $('#outputInputBox').value;
    text = text.replaceAll('\n', '<br>');
    // Collapse multiple breaks
    for (let i = 0; i < 5; i++) text = text.replaceAll('<br><br>', '<br>');
    for (let i = 0; i < 5; i++) text = text.replaceAll('&nbsp;&nbsp;', '&nbsp;');
    setOutput(text);
  });

  $('#clearOutput').addEventListener('click', () => {
    setOutput('<span class="empty-notice">Output will display here</span>');
  });

  // ───────────────────────────────────────────────
  // Parse / Purge HTML
  // ───────────────────────────────────────────────
  $('#parseHTMLBtn').addEventListener('click', () => {
    const fields = $$('p[contenteditable]:not(.correspondences)');
    if (!confirm('Parse all user-input HTML tags (excluding correspondences)?\nOnly do this if you understand XSS risks.')) return;
    fields.forEach(el => {
      el.innerHTML = el.innerHTML.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
    });
  });

  $('#purgeHTMLBtn').addEventListener('click', () => {
    const fields = $$('p[contenteditable]:not(.correspondences)');
    if (!confirm('Remove all HTML formatting (including line breaks) from all fields except correspondences?')) return;
    fields.forEach(el => {
      el.innerHTML = el.innerHTML.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    });
  });

  // ───────────────────────────────────────────────
  // Chrome fix: Enter key inserts <br> not <div>
  // ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.isContentEditable) {
      document.execCommand('insertLineBreak');
      e.preventDefault();
    }
  });

  // ───────────────────────────────────────────────
  // Warn before leaving
  // ───────────────────────────────────────────────
  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
  });

})();
