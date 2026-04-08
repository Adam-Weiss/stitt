# TITT User Guide

**Tibetan Interlinear Translation Tool — Version A.0.1.1**

TITT is a local HTML tool for interlinear translation from Tibetan into English, Hebrew, and/or Russian. It runs in your browser with no server or internet required.

---

## Getting Started

1. Open `index.html` in a modern browser (Firefox recommended).
2. Enable the target languages you need using the checkboxes at the top (English is always on; Hebrew and Russian are optional).
3. Use the example block to get familiar, then delete it and start your project.

## Importing Tibetan Text

Paste Uchen or Wylie text into the import box and choose how to split it into blocks:

- **Double shad (། །)** — default, standard sentence boundary
- **Single shad (།)** — finer splitting at every clause marker
- **Newline** — split wherever the source text has line breaks
- **Multiple spaces** — split on runs of 2+ spaces (useful for column-formatted texts)
- **Custom** — type any character or string to use as an additional break point

Options are combinable. Click **Import** to add blocks to the work area.

## Blocks

Each block contains:
- **Tibetan source** (always visible, numbered automatically)
- **English** translation (collapsible)
- **Hebrew** translation (collapsible, right-to-left)
- **Russian** translation (collapsible)
- **Correspondences** (collapsible) — see detailed section below
- **Notes** (collapsible)

Click on any text to edit it. Click a dropdown label to expand/collapse it.

### Sidebar buttons

Each block has a sidebar (right side) with:
- **^** Move block up
- **-** Delete block (instant, no confirmation)
- **+** Insert a new empty block below
- **v** Move block down

### Block selection

Hover over a block to reveal its checkbox (left side), or check it to keep it visible. Use **Select all / Deselect all** in the bottom controls.

### Merging blocks

Select two or more consecutive blocks using their checkboxes, then click **Merge selected**. The content of each field is concatenated into the first block of each consecutive run, and the remaining blocks are removed.

If you select non-consecutive blocks (e.g. blocks 1, 2, 5, 6), each consecutive group is merged independently (1+2 become one block, 5+6 become another). Lone selected blocks with no consecutive neighbor are left unchanged.

### Deleting blocks

- **Delete selected** — removes all checked blocks (confirms first)
- **Delete all** — removes every block (confirms first)
- **Delete range** — enter a first and last block number to remove that range

## View Toolbar

The pill-toggle bar controls what you see:

- **Visibility pills** — click to toggle a field on/off across all blocks. Green = visible, grey = hidden.
- **Labels** — toggle field name labels (the "English", "Notes", etc. text)
- **Sidebar** — toggle the sidebar buttons
- **Expand all / Collapse all** — open or close every dropdown at once

## Language Toggles

The checkboxes at the top (Hebrew, Russian) control whether those languages appear at all. When unchecked, the fields are completely hidden (no empty space). The visibility pills stay in sync.

## Saving

Click **Save current page** to download the document as an HTML file. Reopen it later in a browser to continue. You can also use Ctrl+S.

## Output Menu

### Block-by-block

Displays a single field from every block, separated by line breaks.

### Interlinear

Pairs the Tibetan source with one or more translations, block by block.

### Continuous

Joins all blocks into a single flowing text (useful for producing a readable translation).

### Correspondence chart

See the Correspondences section below.

### Process text

Paste any text into the bottom input box and use:
- **Line-by-line Tibetan** — split at double shads
- **Continuous** — join into one paragraph
- **Remove extra spaces** — clean up messy formatting

---

## Correspondences — Comprehensive Guide

### What are correspondences?

Correspondences map Tibetan terms to their translations in the target language(s). They are the core linguistic data that connects your source text to your translations. A well-maintained correspondence field lets you:

- Build a consistent glossary as you translate
- Export term lists for flashcard apps (Anki) or spreadsheets
- Track how you've translated key terms across the document
- Spot inconsistencies in your translation choices

### Where to write correspondences

Each block has a **Correspondences** dropdown. Click to expand it, then click the text area to edit.

### Format

Each line is one correspondence entry. Within a line, use a **separator** between the Tibetan term and its translation(s). TITT supports five separators for export:

| Separator | Example |
|-----------|---------|
| comma `,` | `གཟུགས་, form` |
| equals `=` | `གཟུགས་ = form` |
| slash `/` | `གཟུགས་ / form` |
| hyphen `-` | `གཟུགས་ - form` |
| double space | `གཟུགས་  form` |

Pick one separator and use it consistently throughout the entire document. Mixing separators within a document will cause export issues.

### Line breaks = new rows

Press **Enter** (or Return) at the end of a term pair to start a new line. Each line becomes a separate row when you export the correspondence chart.

### Single-language correspondences

The simplest format maps Tibetan to one target language:

```
ཕུང་པོ་, aggregate
གཟུགས་, form
ཚོར་བ་, feeling
འདུ་ཤེས་, perception
```

### Multi-language correspondences

To include translations in multiple languages on the same line, add more separators:

```
གཟུགས་, form, צורה, форма
ཚོར་བ་, feeling, תחושה, чувство
```

This produces a table with four columns when exported. The order of languages should be consistent (e.g. always Tibetan, English, Hebrew, Russian).

### Adding context or notes to a correspondence

You can include parenthetical notes within an entry:

```
འདུ་བྱེད་, formations (lit. "producers")
རྣམ་པར་ཤེས་པ་, consciousness (vijñāna)
```

These notes will appear in the same cell when exported.

### Handling variant translations

If a term has multiple possible translations, you have several options:

**Option 1 — separate lines:**
```
སེམས་, mind
སེམས་, consciousness
```
This creates two rows, both starting with the same Tibetan term.

**Option 2 — list alternatives in one cell:**
```
སེམས་, mind / consciousness
```
Note: if you use slash as your column separator, use a different character for alternatives (e.g. `~` or `or`).

**Option 3 — use notes for the less common translation:**
```
སེམས་, mind (also: consciousness)
```

### Compound or multi-word terms

For multi-word Tibetan terms, include the full phrase:

```
རྣམ་པར་ཤེས་པ་, consciousness
ཡིད་ཀྱི་རྣམ་པར་ཤེས་པ་, mental consciousness
མིག་གི་རྣམ་པར་ཤེས་པ་, eye consciousness
```

### Correspondences with grammatical particles

You may or may not include Tibetan grammatical particles. Both approaches are valid:

```
# Without particles:
གཟུགས་, form
# With particles:
གཟུགས་ཀྱི་, of form (genitive)
```

Including particles can be helpful for language learners. Omitting them keeps the glossary cleaner.

### Exporting correspondences

Use the **Correspondence chart** buttons in the Output menu. Choose the separator that matches what you used in your entries:

1. Click e.g. **comma (,)** if your entries use commas.
2. The output box will display a formatted table.
3. Select all the text in the output box, copy (Ctrl+C), and paste into Word, Excel, Google Sheets, or Anki.

The export collects correspondences from **all blocks** in the document and combines them into a single table.

### Tips for clean exports

- **Be consistent** with your separator across the entire document.
- **Avoid using your chosen separator** inside term descriptions. If you use commas, don't write `form, i.e. rūpa` — instead write `form (i.e. rūpa)`.
- **Trim extra spaces** — TITT strips leading/trailing spaces in cells, but avoid extra spaces mid-entry.
- **One pair per line** — don't put two term pairs on the same line.
- **Check for ghost line breaks** — if you see blank rows in your export, there may be extra Enter presses in the correspondence field.

### Planned features (Version B)

Future versions may support:
- Importing a pre-existing glossary into correspondence fields
- Exporting correspondences directly to CSV or Anki format
- De-duplicating correspondences across the document
