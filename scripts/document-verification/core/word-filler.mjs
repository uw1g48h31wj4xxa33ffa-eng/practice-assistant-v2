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
    
    const newRun = doc.createElement('w:r');
    if (rPrClone) newRun.appendChild(rPrClone);
    
    const newText = doc.createElement('w:t');
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
}
