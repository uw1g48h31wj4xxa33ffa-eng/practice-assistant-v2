export class ArrayFiller {
  static fillFixedRowTable(documentDom, valuesArray, fieldConfig) {
    if (!Array.isArray(valuesArray)) {
      throw new Error(`Value for ${fieldConfig.fieldId} must be an array`);
    }
    
    if (!fieldConfig.arrayConfig) {
      throw new Error(`Missing arrayConfig for ${fieldConfig.fieldId}`);
    }

    const { maxRows, tableIndex, startRowIndex, columns, clearUnused } = fieldConfig.arrayConfig;
    if (typeof maxRows !== 'number' || typeof tableIndex !== 'number' || typeof startRowIndex !== 'number' || !Array.isArray(columns)) {
      throw new Error(`Invalid arrayConfig for ${fieldConfig.fieldId}`);
    }

    if (valuesArray.length > maxRows) {
      throw new Error(`Array length ${valuesArray.length} exceeds maximum rows ${maxRows}`);
    }

    const tables = documentDom.getElementsByTagName('w:tbl');
    if (tableIndex >= tables.length) {
      throw new Error(`Table index ${tableIndex} is out of bounds`);
    }

    const targetTable = tables[tableIndex];

    const getDirectChildren = (node, nodeName) => {
      const children = [];
      const nsParts = nodeName.split(':');
      const localName = nsParts.length > 1 ? nsParts[1] : nodeName;
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeName === nodeName || child.localName === localName) {
          children.push(child);
        }
      }
      return children;
    };

    const rows = getDirectChildren(targetTable, 'w:tr');

    if (startRowIndex + maxRows > rows.length) {
      throw new Error(`Not enough rows in table. Need ${maxRows} rows starting at ${startRowIndex}. Found ${rows.length} rows.`);
    }

    // B. 書込み前の全件事前検証
    for (let i = 0; i < maxRows; i++) {
      const rowIndex = startRowIndex + i;
      const targetRow = rows[rowIndex];
      if (!targetRow) {
        throw new Error(`Row ${rowIndex} does not exist`);
      }
      const cells = getDirectChildren(targetRow, 'w:tc');
      
      const item = valuesArray[i];
      if (item) {
        if (typeof item !== 'object') {
           throw new Error(`Item at index ${i} must be an object`);
        }
        for (const col of columns) {
          if (col.cellIndex >= cells.length) {
            throw new Error(`Column index ${col.cellIndex} out of bounds in row ${rowIndex}`);
          }
        }
      } else if (clearUnused) {
        for (const col of columns) {
          if (col.cellIndex >= cells.length) {
            throw new Error(`Column index ${col.cellIndex} out of bounds in row ${rowIndex} (unused)`);
          }
        }
      }
    }

    // C. 原子性
    const clonedTable = targetTable.cloneNode(true);
    const clonedRows = getDirectChildren(clonedTable, 'w:tr');

    for (let i = 0; i < maxRows; i++) {
      const rowIndex = startRowIndex + i;
      const targetRow = clonedRows[rowIndex];
      const cells = getDirectChildren(targetRow, 'w:tc');
      const item = valuesArray[i];

      if (item) {
        for (const col of columns) {
          const targetCell = cells[col.cellIndex];
          const val = item[col.key];
          
          if (val !== undefined && val !== null && val !== '') {
            this._fillCellText(targetCell, String(val));
          } else if (clearUnused) {
            this._fillCellText(targetCell, '');
          }
        }
      } else if (clearUnused) {
        for (const col of columns) {
          this._fillCellText(cells[col.cellIndex], '');
        }
      }
    }

    targetTable.parentNode.replaceChild(clonedTable, targetTable);
  }

  static _fillCellText(tcNode, value) {
    const getDirectChildren = (node, nodeName) => {
      const children = [];
      const nsParts = nodeName.split(':');
      const localName = nsParts.length > 1 ? nsParts[1] : nodeName;
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeName === nodeName || child.localName === localName) {
          children.push(child);
        }
      }
      return children;
    };

    const ps = getDirectChildren(tcNode, 'w:p');
    if (ps.length === 0) return;
    const targetP = ps[0];

    const runs = targetP.getElementsByTagName('w:r');
    let rPrClone = null;
    if (runs.length > 0) {
      const rPrs = runs[0].getElementsByTagName('w:rPr');
      if (rPrs.length > 0) rPrClone = rPrs[0].cloneNode(true);
    }
    if (!rPrClone) {
      const pPrs = targetP.getElementsByTagName('w:pPr');
      if (pPrs.length > 0) {
        const rPrs = pPrs[0].getElementsByTagName('w:rPr');
        if (rPrs.length > 0) rPrClone = rPrs[0].cloneNode(true);
      }
    }

    const runsArray = getDirectChildren(targetP, 'w:r');
    for (const run of runsArray) {
      targetP.removeChild(run);
    }

    if (value !== '') {
      const doc = tcNode.ownerDocument;
      const newRun = doc.createElement('w:r');
      if (rPrClone) newRun.appendChild(rPrClone);
      
      const newText = doc.createElement('w:t');
      newText.setAttribute('xml:space', 'preserve');
      newText.textContent = value;
      newRun.appendChild(newText);
      targetP.appendChild(newRun);
    }
  }
}
