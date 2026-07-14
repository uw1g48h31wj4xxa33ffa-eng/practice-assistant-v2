export class WordFiller {
  static fillField(tcNode, value, fieldConfig) {
    if (fieldConfig.status !== 'confirmed') {
      throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    }

    if (fieldConfig.validation) {
      const val = fieldConfig.validation;
      if (val.rejectEmpty && (!value || value.trim() === '')) {
        throw new Error(`Value is empty`);
      }
      if (val.rejectLetters && /[a-zA-Z]/.test(value)) {
        throw new Error(`Value contains letters`);
      }
      if (val.rejectSymbols && /[^\d\-]/.test(value)) {
        throw new Error(`Value contains symbols`);
      }
      const digitCount = (value.match(/\d/g) || []).length;
      if (val.allowedDigits && !val.allowedDigits.includes(digitCount)) {
        throw new Error(`Invalid digit count: ${digitCount}`);
      }
      if (val.maxLength && value.length > val.maxLength) {
        throw new Error(`Value exceeds max length of ${val.maxLength}`);
      }
      if (val.rejectInvalidChars) {
        if (/[\n\r\t]/.test(value)) throw new Error('Value contains newline or tab');
        if (/[\x00-\x1F\x7F]/.test(value)) throw new Error('Value contains control characters');
        if (/<[^>]+>/.test(value)) throw new Error('Value contains HTML/XML tags');
      }
    }

    const ps = tcNode.getElementsByTagName('w:p');
    if (ps.length === 0) throw new Error('Target cell has no paragraph.');
    const targetP = ps[0];
    
    const doc = tcNode.ownerDocument;
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

    // Remove all existing runs to cleanly replace text (e.g. removing placeholders like "(   )")
    const runsArray = Array.from(runs);
    for (const run of runsArray) {
      targetP.removeChild(run);
    }
    
    if (!value || value === '') {
      return;
    }

    // append text as a single run in the first paragraph
    const newRun = tcNode.ownerDocument.createElement('w:r');
    if (rPrClone) newRun.appendChild(rPrClone);
    const newText = tcNode.ownerDocument.createElement('w:t');
    newText.setAttribute('xml:space', 'preserve');
    newText.textContent = value;
    newRun.appendChild(newText);
    
    targetP.appendChild(newRun);
  }

  static fillDistributedField(distributedResult, value, fieldConfig) {
    if (fieldConfig.status !== 'confirmed') {
      throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    }

    if (!value || value.trim() === '') {
      throw new Error(`Value is empty`);
    }

    // Normalize input
    let normalized = value.replace(/[－-]/g, '');
    if (!/^\d+$/.test(normalized)) {
      if (/[a-zA-Z]/.test(value)) throw new Error('Value contains letters');
      if (/\s/.test(value)) throw new Error('Value contains spaces');
      if (/[\n\r\t]/.test(value)) throw new Error('Value contains newline or tab');
      if (/[\x00-\x1F\x7F]/.test(value)) throw new Error('Value contains control characters');
      throw new Error('Value contains non-digit characters');
    }

    if (normalized.length !== distributedResult.metadata.digitCount) {
      throw new Error(`Digit count mismatch. Expected ${distributedResult.metadata.digitCount}, got ${normalized.length}`);
    }

    // Check hyphen format if hyphens are present
    if (value.includes('-') || value.includes('－')) {
      const parts = value.split(/[－-]/);
      if (parts.length - 1 !== distributedResult.metadata.separatorCount) {
        throw new Error(`Invalid hyphen count. Expected ${distributedResult.metadata.separatorCount}`);
      }
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].length !== distributedResult.metadata.groups[i]) {
          throw new Error(`Invalid hyphen position or group length at group index ${i}`);
        }
      }
    }

    // Fill each digit into each cell
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      const tcNode = distributedResult.digitCells[i];
      
      const ps = tcNode.getElementsByTagName('w:p');
      if (ps.length === 0) throw new Error('Target cell has no paragraph.');
      const targetP = ps[0];
      
      const doc = tcNode.ownerDocument;
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

      // Remove all existing runs
      const runsArray = Array.from(runs);
      for (const run of runsArray) {
        targetP.removeChild(run);
      }
      
      const newRun = doc.createElement('w:r');
      if (rPrClone) newRun.appendChild(rPrClone);
      
      const newText = doc.createElement('w:t');
      newText.setAttribute('xml:space', 'preserve');
      newText.textContent = char;
      newRun.appendChild(newText);
      targetP.appendChild(newRun);
    }
  }

  static fillNumericFieldPreservingAffix(tcNode, value, fieldConfig) {
    if (fieldConfig.status !== 'confirmed') {
      throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    }

    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Value is empty`);
    }

    let normalized = value;

    if (fieldConfig.validation?.normalizeFullWidthDigits) {
      normalized = normalized.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    }

    if (fieldConfig.affix?.suffixText) {
       if (normalized.includes(fieldConfig.affix.suffixText)) {
         throw new Error(`Value contains affix ${fieldConfig.affix.suffixText}`);
       }
    }

    if (/[\n\r\t]/.test(normalized)) throw new Error('Value contains newline or tab');
    if (/[\x00-\x1F\x7F]/.test(normalized)) throw new Error('Value contains control characters');
    if (/<[^>]+>/.test(normalized)) throw new Error('Value contains HTML/XML tags');
    if (/[a-zA-Z]/.test(normalized)) throw new Error('Value contains letters');

    if (fieldConfig.validation?.allowComma === false && normalized.includes(',')) {
       throw new Error('Value contains comma');
    }

    if (fieldConfig.validation?.allowNegative === false && normalized.includes('-')) {
       throw new Error('Value contains negative sign');
    }

    if (fieldConfig.validation?.allowDecimal === false && normalized.includes('.')) {
       throw new Error('Value contains decimal point');
    }

    if (/[^\d\.\-,]/.test(normalized)) {
       throw new Error('Value contains symbols');
    }
    
    // Parse to number to check bounds
    const numValue = Number(normalized.replace(/,/g, ''));
    if (isNaN(numValue)) {
       throw new Error('Value is not a valid number');
    }

    if (fieldConfig.validation?.allowZero === false && numValue === 0) {
       throw new Error('Value is zero');
    }

    if (fieldConfig.validation?.min !== undefined && numValue < fieldConfig.validation.min) {
       throw new Error(`Value is less than minimum ${fieldConfig.validation.min}`);
    }

    if (fieldConfig.validation?.max !== undefined && numValue > fieldConfig.validation.max) {
       throw new Error(`Value exceeds maximum ${fieldConfig.validation.max}`);
    }
    
    if (fieldConfig.validation?.maxDigits !== undefined) {
       const digitCount = (normalized.match(/\d/g) || []).length;
       if (digitCount > fieldConfig.validation.maxDigits) {
          throw new Error(`Value exceeds max digits of ${fieldConfig.validation.maxDigits}`);
       }
    }

    const ps = tcNode.getElementsByTagName('w:p');
    if (ps.length === 0) throw new Error('Target cell has no paragraph.');
    
    // We expect to find exactly one run that contains the suffix text
    let suffixRun = null;
    let targetP = null;
    let suffixCount = 0;

    for (let i = 0; i < ps.length; i++) {
       const runs = ps[i].getElementsByTagName('w:r');
       for (let j = 0; j < runs.length; j++) {
          const run = runs[j];
          let parent = run.parentNode;
          let isDeleted = false;
          while (parent) {
             if (parent.nodeName === 'w:del' || parent.nodeName === 'w:moveFrom') {
                isDeleted = true;
                break;
             }
             parent = parent.parentNode;
          }
          if (isDeleted) continue;

          const tNodes = run.getElementsByTagName('w:t');
          let text = '';
          for (let k = 0; k < tNodes.length; k++) {
             text += tNodes[k].textContent;
          }

          if (text === fieldConfig.affix.suffixText) {
             suffixCount++;
             suffixRun = run;
             targetP = ps[i];
          }
       }
    }

    if (suffixCount === 0) {
       throw new Error('Suffix run not found in target cell');
    }
    if (suffixCount > 1) {
       throw new Error('Multiple suffix runs found in target cell');
    }

    const doc = tcNode.ownerDocument;
    
    // Create new numeric run
    let rPrClone = null;
    const rPrs = suffixRun.getElementsByTagName('w:rPr');
    if (rPrs.length > 0) rPrClone = rPrs[0].cloneNode(true);
    
    if (!rPrClone) {
       const pPrs = targetP.getElementsByTagName('w:pPr');
       if (pPrs.length > 0) {
          const pRPrs = pPrs[0].getElementsByTagName('w:rPr');
          if (pRPrs.length > 0) rPrClone = pRPrs[0].cloneNode(true);
       }
    }

    const newRun = doc.createElement('w:r');
    if (rPrClone) newRun.appendChild(rPrClone);
    
    const newText = doc.createElement('w:t');
    newText.setAttribute('xml:space', 'preserve');
    // Ensure we insert a space if needed? Instructions say "25 人" is rejected as input, but output should be "25 人"?
    // The original document has "人" right aligned, with some space before it probably filled by the width of the cell.
    // The instructions say "接尾辞Runの直前に数値用Runを追加"
    // We will just put the normalized number.
    newText.textContent = normalized;
    newRun.appendChild(newText);

    // Remove all other runs in targetP EXCEPT suffixRun (to clear placeholders)
    const runsArray = Array.from(targetP.getElementsByTagName('w:r'));
    for (const run of runsArray) {
       if (run !== suffixRun) {
          targetP.removeChild(run);
       }
    }

    targetP.insertBefore(newRun, suffixRun);
  }
}
