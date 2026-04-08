/* ===== TITT — Tibetan Interlinear Translation Tool ===== */
/* Version A.0.1 */

(function () {
  'use strict';

  // ───────────────────────────────────────────────
  // Configuration — field definitions
  // ───────────────────────────────────────────────
  const FIELDS = [
    { key: 'english',         label: 'English',         cssClass: 'english-dropdown',         rtl: false },
    { key: 'hebrew',          label: 'Hebrew',          cssClass: 'hebrew-dropdown',          rtl: true  },
    { key: 'russian',         label: 'Russian',         cssClass: 'russian-dropdown',         rtl: false },
    { key: 'correspondences', label: 'Correspondences', cssClass: 'correspondences-dropdown', rtl: false },
    { key: 'notes',           label: 'Notes',           cssClass: 'notes-dropdown',           rtl: false },
  ];

  // Track which dropdowns are open for new blocks
  const openState = {};
  FIELDS.forEach(f => { openState[f.key] = ''; });

  // ───────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

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
  function isFieldVisible(cssClass) {
    const rule = findCSSRule('.' + cssClass);
    return rule && rule.style.display !== 'none';
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
  // Block HTML template
  // ───────────────────────────────────────────────
  function blockHTML(tibetanContent) {
    const tib = tibetanContent || 'Add Tibetan text';
    let html = '<div class="block">';
    html += '<input type="checkbox" class="block-select" title="Select this block">';
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
    html += '<button class="up" title="Move up">&and;</button>';
    html += '<button class="delete" title="Delete">&minus;</button>';
    html += '<button class="insert" title="Insert below">&#43;</button>';
    html += '<button class="down" title="Move down">&or;</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  // ───────────────────────────────────────────────
  // New Block / Save
  // ───────────────────────────────────────────────
  $('#newBlock').addEventListener('click', () => {
    $('#end-marker').insertAdjacentHTML('beforebegin', blockHTML());
  });

  $('#savePage').addEventListener('click', () => {
    const data = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
    const a = document.createElement('a');
    a.setAttribute('download', 'titt-document.html');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    a.click();
  });

  // ───────────────────────────────────────────────
  // Sidebar: delete, insert, move (event delegation)
  // ───────────────────────────────────────────────
  document.body.addEventListener('click', (e) => {
    const t = e.target;
    if (!t.matches || !t.matches('.sidebar button')) return;
    const block = t.closest('.block');
    if (!block) return;

    if (t.classList.contains('delete')) {
      block.remove();
    }

    if (t.classList.contains('insert')) {
      block.insertAdjacentHTML('afterend', blockHTML());
    }

    if (t.classList.contains('up')) {
      const prev = block.previousElementSibling;
      if (!prev || !prev.classList.contains('block')) return;
      prev.insertAdjacentHTML('beforebegin', block.outerHTML);
      block.remove();
    }

    if (t.classList.contains('down')) {
      const next = block.nextElementSibling;
      if (!next || !next.classList.contains('block')) return;
      next.insertAdjacentHTML('afterend', block.outerHTML);
      block.remove();
    }
  });

  // ───────────────────────────────────────────────
  // Delete controls: selected, all, range
  // ───────────────────────────────────────────────
  $('#deleteSelectedBtn').addEventListener('click', () => {
    const checked = $$('.block-select:checked');
    if (checked.length === 0) return;
    if (!confirm('Delete ' + checked.length + ' selected block(s)?')) return;
    checked.forEach(cb => cb.closest('.block').remove());
  });

  $('#deleteAllBtn').addEventListener('click', () => {
    const blocks = $$('.block');
    if (blocks.length === 0) return;
    if (!confirm('Delete all ' + blocks.length + ' block(s)?')) return;
    blocks.forEach(b => b.remove());
  });

  $('#massDeleteBtn').addEventListener('click', () => {
    const blocks = $$('.block');
    const min = parseInt($('#rangeMin').value, 10);
    const max = parseInt($('#rangeMax').value, 10);
    if (blocks.length === 0) return;
    if (isNaN(min) || min < 1 || isNaN(max) || max > blocks.length || max < min) return;
    const count = max - min + 1;
    if (!confirm('Delete ' + count + ' block(s) (' + min + '–' + max + ')?')) return;
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (i + 1 >= min && i + 1 <= max) blocks[i].remove();
    }
  });

  $('#selectAllBlocks').addEventListener('click', () => {
    $$('.block-select').forEach(cb => { cb.checked = true; });
  });
  $('#deselectAllBlocks').addEventListener('click', () => {
    $$('.block-select').forEach(cb => { cb.checked = false; });
  });

  // ───────────────────────────────────────────────
  // View Toolbar (replaces SHOC)
  // ───────────────────────────────────────────────

  // Visibility toggle pills
  function initVisibilityPills() {
    FIELDS.forEach(f => {
      const pill = $(`#vis-${f.key}`);
      if (!pill) return;
      // Set initial state from CSS rule
      if (isFieldVisible(f.cssClass)) {
        pill.classList.add('active');
      }
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
        if (pill.classList.contains('active')) {
          showField(f.cssClass);
        } else {
          hideField(f.cssClass);
        }
      });
    });

    // Sidebar pill
    const sidebarPill = $('#vis-sidebar');
    if (sidebarPill) {
      sidebarPill.classList.add('active');
      sidebarPill.addEventListener('click', () => {
        sidebarPill.classList.toggle('active');
        const rule = findCSSRule('.sidebar');
        if (rule) rule.style.visibility = sidebarPill.classList.contains('active') ? 'visible' : 'hidden';
      });
    }

    // Field names pill
    const fnPill = $('#vis-fieldnames');
    if (fnPill) {
      fnPill.classList.add('active');
      fnPill.addEventListener('click', () => {
        fnPill.classList.toggle('active');
        const rule = findCSSRule('summary.field-name');
        if (rule) rule.style.display = fnPill.classList.contains('active') ? 'list-item' : 'none';
      });
    }
  }
  initVisibilityPills();

  // Expand / Collapse all
  $('#expandAll').addEventListener('click', () => {
    FIELDS.forEach(f => openField(f.cssClass, f.key));
  });
  $('#collapseAll').addEventListener('click', () => {
    FIELDS.forEach(f => closeField(f.cssClass, f.key));
  });

  // ───────────────────────────────────────────────
  // Language Toggles
  // ───────────────────────────────────────────────
  function bindLangToggle(checkboxId, cssClass, pillId) {
    const cb = $(checkboxId);
    const pill = $(pillId);
    if (!cb) return;
    cb.addEventListener('change', () => {
      if (cb.checked) {
        showField(cssClass);
        if (pill) pill.classList.add('active');
      } else {
        hideField(cssClass);
        if (pill) pill.classList.remove('active');
      }
    });
    // Sync pill with checkbox on init
    if (!cb.checked) {
      hideField(cssClass);
      if (pill) pill.classList.remove('active');
    }
  }
  bindLangToggle('#toggleHebrew', 'hebrew-dropdown', '#vis-hebrew');
  bindLangToggle('#toggleRussian', 'russian-dropdown', '#vis-russian');

  // ───────────────────────────────────────────────
  // Import Tibetan Text
  // ───────────────────────────────────────────────
  $('#importTibetanBtn').addEventListener('click', () => {
    const raw = $('#importBox').value;
    if (!raw.trim()) return;

    const useDoubleShad = $('#breakDoubleShad').checked;
    const useSingleShad = $('#breakSingleShad').checked;
    const useNewline = $('#breakNewline').checked;
    const useWhitespace = $('#breakWhitespace').checked;
    const customBreak = $('#breakCustom').value.trim();

    // Check at least one option
    if (!useDoubleShad && !useSingleShad && !useNewline && !useWhitespace && !customBreak) {
      alert('Select at least one break option.');
      return;
    }

    let text = raw;

    // Escape Wylie markers before processing
    text = text.replaceAll('@#/_/', '\x01YINGO\x01');
    text = text.replaceAll('༄༅། །', '\x01HEAD2\x01');
    text = text.replaceAll('༄༅༅། །', '\x01HEAD3\x01');

    // Use a unique placeholder for line breaks
    const BRK = '\x02BRK\x02';

    // Apply break rules in order of specificity (most specific first)
    if (useDoubleShad) {
      text = text.replaceAll('། །', '། །' + BRK);
    }
    if (useSingleShad) {
      // Single shad not already part of a double-shad break
      // Split on ། followed by space (but not if it's ། །)
      text = text.replaceAll('།' + BRK + ' །' + BRK, '། །' + BRK); // fix double-break from both rules
      // For single shad: match ། not followed by །
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += text[i];
        if (text[i] === '།' && text[i + 1] !== ' ' && text[i + 1] !== '།' && !text.substring(i).startsWith('།' + BRK)) {
          // Single shad not before space-shad
          result += BRK;
        }
      }
      text = result;
    }
    if (useNewline) {
      text = text.replaceAll('\r\n', BRK);
      text = text.replaceAll('\n', BRK);
    }
    if (useWhitespace) {
      // Break on runs of 2+ whitespace (but not single spaces which are normal)
      text = text.replace(/[ \t]{2,}/g, BRK);
    }
    if (customBreak) {
      text = text.replaceAll(customBreak, customBreak + BRK);
    }

    // Wylie special chars for HTML safety
    text = text.replaceAll('/_/', '&sol;&lowbar;&sol;');
    text = text.replaceAll('/', '&sol;');
    text = text.replaceAll('_', '&lowbar;');
    text = text.replaceAll('*', '&ast;');

    // Restore markers
    text = text.replaceAll('\x01YINGO\x01', '@#/_/');
    text = text.replaceAll('\x01HEAD2\x01', '༄༅། །');
    text = text.replaceAll('\x01HEAD3\x01', '༄༅༅། །');

    // Remove stray whitespace from Tibetan
    text = text.replaceAll('་ ', '་');

    const lines = text.split(BRK).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 1) return;

    for (const line of lines) {
      $('#end-marker').insertAdjacentHTML('beforebegin', blockHTML(line));
    }
  });

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
    setOutput('<div dir="rtl">' + getFieldContents('hebrew').join('<br>') + '</div>');
  });
  $('#outRussianBlock').addEventListener('click', () => {
    setOutput(getFieldContents('russian').join('<br>'));
  });
  $('#outCorrespondencesBlock').addEventListener('click', () => {
    let out = getFieldContents('correspondences').join('<br>');
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
    setOutput(getFieldContents('english').map(s => s.replaceAll('<br>', ' ')).join(' '));
  });
  $('#outHebrewCont').addEventListener('click', () => {
    const out = getFieldContents('hebrew').map(s => s.replaceAll('<br>', ' ')).join(' ');
    setOutput('<div dir="rtl">' + out + '</div>');
  });
  $('#outRussianCont').addEventListener('click', () => {
    setOutput(getFieldContents('russian').map(s => s.replaceAll('<br>', ' ')).join(' '));
  });

  // ───────────────────────────────────────────────
  // Output — correspondence charts
  // ───────────────────────────────────────────────
  function buildCorrespondenceTable(colSeparator, entityEncode) {
    const items = getFieldContents('correspondences');
    let flat = items.join('<br>');
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
    const items = getFieldContents('correspondences');
    let flat = items.join('<br>');
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
  // Output — from input box
  // ───────────────────────────────────────────────
  $('#outInputLineByLine').addEventListener('click', () => {
    let text = $('#outputInputBox').value;
    text = text.replaceAll('\n', '');
    // Uchen
    text = text.replaceAll('༄༅། །', '\x01A\x01');
    text = text.replaceAll('༄༅༅། །', '\x01B\x01');
    text = text.replaceAll('། །', '\x01D\x01');
    text = text.replaceAll('། ', '\x01S\x01');
    text = text.replaceAll('\x01D\x01', '། །<br>');
    text = text.replaceAll('\x01S\x01', '། ');
    text = text.replaceAll('\x01A\x01', '༄༅། །');
    text = text.replaceAll('\x01B\x01', '༄༅༅། །');
    text = text.replaceAll('་ ', '་');
    // Wylie
    text = text.replaceAll('@#/_/', '\x01A\x01');
    text = text.replaceAll('@##/_/', '\x01B\x01');
    text = text.replaceAll('/_/', '\x01D\x01');
    text = text.replaceAll('\x01D\x01', '/_/<br>');
    text = text.replaceAll('\x01A\x01', '@#/_/');
    text = text.replaceAll('\x01B\x01', '@##/_/');
    setOutput(text);
  });

  $('#outInputContinuous').addEventListener('click', () => {
    let text = $('#outputInputBox').value;
    text = text.replaceAll('\n', ' ').replaceAll('  ', ' ');
    setOutput(text);
  });

  $('#outInputRemoveSpaces').addEventListener('click', () => {
    let text = $('#outputInputBox').value;
    text = text.replaceAll('\n', '<br>');
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
    $$('p[contenteditable]:not(.correspondences)').forEach(el => {
      el.innerHTML = el.innerHTML.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
    });
  });

  $('#purgeHTMLBtn').addEventListener('click', () => {
    if (!confirm('Strip all HTML formatting from fields (except correspondences)?')) return;
    $$('p[contenteditable]:not(.correspondences)').forEach(el => {
      el.innerHTML = el.innerHTML.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    });
  });

  // ───────────────────────────────────────────────
  // Chrome fix: Enter inserts <br> not <div>
  // ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.isContentEditable) {
      document.execCommand('insertLineBreak');
      e.preventDefault();
    }
  });

  // ───────────────────────────────────────────────
  // Warn before leaving (single gentle prompt)
  // ───────────────────────────────────────────────
  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
  });

})();
