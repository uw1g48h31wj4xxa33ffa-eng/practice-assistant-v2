export class FieldLocator {
  static getCellText(tcNode) {
    let text = '';
    const runs = tcNode.getElementsByTagName('w:r');
    for (let i = 0; i < runs.length; i++) {
      const texts = runs[i].getElementsByTagName('w:t');
      for (let j = 0; j < texts.length; j++) {
        text += texts[j].textContent || '';
      }
    }
    return text.trim();
  }

  static findCellByExactText(documentDom, exactText) {
    const matches = [];
    const tables = documentDom.getElementsByTagName('w:tbl');
    for (let t = 0; t < tables.length; t++) {
      const rows = tables[t].getElementsByTagName('w:tr');
      for (let r = 0; r < rows.length; r++) {
        const cells = rows[r].getElementsByTagName('w:tc');
        for (let c = 0; c < cells.length; c++) {
          const text = this.getCellText(cells[c]);
          if (text === exactText) {
            matches.push({
              tableIndex: t,
              rowIndex: r,
              cellIndex: c,
              tcNode: cells[c],
              trNode: rows[r],
              tblNode: tables[t],
              cells: cells,
              rows: rows
            });
          }
        }
      }
    }
    return matches;
  }

  static locateAdjacentCell(documentDom, exactLabelText) {
    const matches = this.findCellByExactText(documentDom, exactLabelText);
    if (matches.length === 0) throw new Error(`Label "${exactLabelText}" not found`);
    if (matches.length > 1) throw new Error(`Label "${exactLabelText}" found multiple times`);

    const match = matches[0];
    if (match.cellIndex + 1 >= match.cells.length) {
      throw new Error(`No adjacent cell found for label "${exactLabelText}"`);
    }
    const targetCell = match.cells[match.cellIndex + 1];

    // Check if it has a paragraph
    if (targetCell.getElementsByTagName('w:p').length === 0) {
      throw new Error(`Adjacent cell has no paragraph`);
    }

    return targetCell;
  }

  static locateSameCellByExactText(documentDom, exactLabelText, config = {}) {
    const matches = this.findCellByExactText(documentDom, exactLabelText);
    if (matches.length === 0) throw new Error(`Label "${exactLabelText}" not found`);

    let match;
    if (config.matchIndex !== undefined) {
      if (config.matchIndex >= matches.length) {
        throw new Error(`Label "${exactLabelText}" found, but matchIndex ${config.matchIndex} is out of bounds (found ${matches.length})`);
      }
      match = matches[config.matchIndex];
    } else {
      if (matches.length > 1) {
        throw new Error(`Label "${exactLabelText}" found multiple times and no matchIndex provided`);
      }
      match = matches[0];
    }

    if (match.tcNode.getElementsByTagName('w:p').length === 0) {
      throw new Error(`Same cell has no paragraph`);
    }

    return match.tcNode;
  }

  static locateNextRowContinuationCell(documentDom, exactLabelText) {
    const matches = this.findCellByExactText(documentDom, exactLabelText);
    if (matches.length === 0) throw new Error(`Label "${exactLabelText}" not found`);
    if (matches.length > 1) throw new Error(`Label "${exactLabelText}" found multiple times`);

    const match = matches[0];
    if (match.rowIndex + 1 >= match.rows.length) {
      throw new Error(`No next row found for label "${exactLabelText}"`);
    }

    // Verify vMerge of label
    const labelTcPr = match.tcNode.getElementsByTagName('w:tcPr')[0];
    let labelHasVMerge = false;
    if (labelTcPr) {
      const vMerge = labelTcPr.getElementsByTagName('w:vMerge');
      if (vMerge.length > 0) labelHasVMerge = true;
    }
    if (!labelHasVMerge) {
      throw new Error(`Label cell does not have vMerge`);
    }

    const nextRow = match.rows[match.rowIndex + 1];
    const nextRowCells = nextRow.getElementsByTagName('w:tc');

    // In the next row, Cell 0 is the vMerge continuation of the label.
    // The actual address input area is Cell 1 (which spans across columns).
    if (nextRowCells.length > 1) {
       const tc = nextRowCells[1];
       const ps = tc.getElementsByTagName('w:p');
       if (ps.length > 0) {
         return tc;
       }
    }

    throw new Error(`Could not find empty continuation cell for "${exactLabelText}"`);
  }

  static locateDistributedCells(documentDom, exactLabelText, pattern) {
    const matches = this.findCellByExactText(documentDom, exactLabelText);
    if (matches.length === 0) throw new Error(`Label "${exactLabelText}" not found`);
    if (matches.length > 1) throw new Error(`Label "${exactLabelText}" found multiple times`);

    const match = matches[0];
    const cells = match.cells;
    let currentIndex = match.cellIndex + 1;

    const result = {
      labelCell: match.tcNode,
      rowNode: match.trNode,
      digitCells: [],
      separatorCells: [],
      ignoredCells: [],
      metadata: {
        digitCount: 0,
        separatorCount: 0,
        groups: []
      }
    };

    for (const p of pattern) {
      const pCount = p.count || 1;
      if (currentIndex + pCount > cells.length) {
        throw new Error(`Not enough cells remaining to match pattern for "${exactLabelText}"`);
      }

      for (let i = 0; i < pCount; i++) {
        const cell = cells[currentIndex];
        const text = this.getCellText(cell);

        // Ensure not crossed out unless it's ignore
        const tcPr = cell.getElementsByTagName('w:tcPr')[0];
        let isCrossed = false;
        if (tcPr && tcPr.getElementsByTagName('w:tr2bl').length > 0) {
          isCrossed = true;
        }

        if (p.type === 'digits') {
          if (isCrossed) throw new Error('Digit cell cannot be crossed out');
          result.digitCells.push(cell);
          result.metadata.digitCount++;
        } else if (p.type === 'separator') {
          if (isCrossed) throw new Error('Separator cell cannot be crossed out');
          if (text !== p.text) {
            throw new Error(`Separator mismatch. Expected "${p.text}", found "${text}"`);
          }
          result.separatorCells.push(cell);
          result.metadata.separatorCount++;
        } else if (p.type === 'ignore') {
          result.ignoredCells.push(cell);
        }

        currentIndex++;
      }

      if (p.type === 'digits') {
        result.metadata.groups.push(pCount);
      }
    }

    if (currentIndex < cells.length) {
      throw new Error(`Unclassified cells remaining after pattern matching for "${exactLabelText}"`);
    }

    return result;
  }

  static locateMultiRowDistributedCells(documentDom, exactLabelText, config) {
    const matches = this.findCellByExactText(documentDom, exactLabelText);
    if (matches.length === 0) throw new Error(`Label "${exactLabelText}" not found`);
    if (matches.length > 1) throw new Error(`Label "${exactLabelText}" found multiple times`);

    const match = matches[0];
    let targetRow = match.trNode;

    // Move to target row
    const offset = config.targetRowOffset || 0;
    for (let i = 0; i < offset; i++) {
      let next = targetRow.nextSibling;
      while (next && next.nodeName !== 'w:tr') {
        next = next.nextSibling;
      }
      if (!next) throw new Error(`Target row offset ${offset} exceeds available rows for "${exactLabelText}"`);
      targetRow = next;
    }

    const cells = targetRow.getElementsByTagName('w:tc');
    let currentIndex = 0;

    const result = {
      labelCell: match.tcNode,
      labelRow: match.trNode,
      targetRow: targetRow,
      digitCells: [],
      separatorCells: [],
      ignoredCells: [],
      groupedDigitCells: {},
      metadata: {
        digitCount: 0,
        separatorCount: 0,
        ignoreCount: 0,
        groups: [],
        targetRowOffset: offset
      }
    };

    // Initialize groupedDigitCells for all digit groups
    for (const p of config.pattern) {
      if (p.type === 'digits' && p.groupId) {
        result.groupedDigitCells[p.groupId] = [];
      }
    }

    for (const p of config.pattern) {
      const pCount = p.count || 1;
      if (currentIndex + pCount > cells.length) {
        throw new Error(`Not enough cells remaining to match pattern for "${exactLabelText}"`);
      }

      for (let i = 0; i < pCount; i++) {
        const cell = cells[currentIndex];
        const text = this.getCellText(cell);

        // Ensure not crossed out unless it's ignore
        const tcPr = cell.getElementsByTagName('w:tcPr')[0];
        let isCrossed = false;
        if (tcPr && tcPr.getElementsByTagName('w:tr2bl').length > 0) {
          isCrossed = true;
        }

        // Check for history or form controls
        if (cell.getElementsByTagName('w:del').length > 0) throw new Error('Cell contains deletion history');
        if (cell.getElementsByTagName('w:moveFrom').length > 0) throw new Error('Cell contains move history');
        if (cell.getElementsByTagName('w:fldChar').length > 0) throw new Error('Cell contains form controls');

        // Check for hidden (vanish)
        const rPrs = cell.getElementsByTagName('w:rPr');
        for (let j = 0; j < rPrs.length; j++) {
          if (rPrs[j].getElementsByTagName('w:vanish').length > 0) throw new Error('Cell is hidden');
        }

        if (p.type === 'digits') {
          if (isCrossed) throw new Error('Digit cell cannot be crossed out');
          result.digitCells.push(cell);
          result.metadata.digitCount++;
          if (p.groupId) {
            result.groupedDigitCells[p.groupId].push(cell);
          }
        } else if (p.type === 'separator') {
          if (isCrossed) throw new Error('Separator cell cannot be crossed out');
          if (text !== p.text) {
            throw new Error(`Separator mismatch. Expected "${p.text}", found "${text}"`);
          }
          result.separatorCells.push(cell);
          result.metadata.separatorCount++;
        } else if (p.type === 'ignore') {
          result.ignoredCells.push(cell);
          result.metadata.ignoreCount++;
        }

        currentIndex++;
      }

      if (p.type === 'digits') {
        result.metadata.groups.push(pCount);
      }
    }

    if (currentIndex < cells.length) {
      throw new Error(`Unclassified cells remaining after pattern matching for "${exactLabelText}"`);
    }

    return result;
  }
}
