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
}
