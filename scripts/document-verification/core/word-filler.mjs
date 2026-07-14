export class WordFiller {
  static fillTextPreservingPrefix(tcNode, value, fieldConfig) {
    if (fieldConfig.status !== 'confirmed') throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    if (value === undefined || value === null || value === '') {
      if (fieldConfig.validation && fieldConfig.validation.rejectEmpty) throw new Error(`Value is empty`);
      return;
    }
    if (typeof value !== 'string') throw new Error(`Value must be a string`);

    if (fieldConfig.validation) {
      const val = fieldConfig.validation;
      if (val.rejectEmpty && value.trim() === '') throw new Error(`Value is empty`);
      if (val.maxLength && value.length > val.maxLength) throw new Error(`Value exceeds max length of ${val.maxLength}`);
      if (val.rejectInvalidChars) {
        if (/[\n\r\t]/.test(value)) throw new Error('Value contains newline or tab');
        if (/[\x00-\x1F\x7F]/.test(value)) throw new Error('Value contains control characters');
        if (/<[^>]+>/.test(value)) throw new Error('Value contains HTML/XML tags');
      }
    }

    const prefix = fieldConfig.preserve.prefixText;
    const ps = tcNode.getElementsByTagName('w:p');
    if (ps.length === 0) throw new Error('Target cell has no paragraph.');
    const p = ps[0];

    const runs = tcNode.getElementsByTagName('w:r');
    let fullText = '';
    for (let i = 0; i < runs.length; i++) {
       const texts = runs[i].getElementsByTagName('w:t');
       for (let j = 0; j < texts.length; j++) fullText += texts[j].textContent || '';
    }

    if (!fullText.includes(prefix)) throw new Error(`Prefix "${prefix}" not found in cell`);

    let prefixRunsEndIndex = -1;
    let accumulatedText = '';
    let rPrClone = null;

    for (let i = 0; i < runs.length; i++) {
       const texts = runs[i].getElementsByTagName('w:t');
       for (let j = 0; j < texts.length; j++) accumulatedText += texts[j].textContent || '';
       if (accumulatedText.length >= prefix.length) {
         if (accumulatedText.substring(0, prefix.length) !== prefix) throw new Error(`Prefix mismatch`);
         prefixRunsEndIndex = i;
         const rPrs = runs[i].getElementsByTagName('w:rPr');
         if (rPrs.length > 0) rPrClone = rPrs[0].cloneNode(true);
         break;
       }
    }

    if (prefixRunsEndIndex === -1) throw new Error(`Prefix not fully found`);

    const runsArray = Array.from(runs);
    for (let i = prefixRunsEndIndex + 1; i < runsArray.length; i++) {
       p.removeChild(runsArray[i]);
    }

    const lastPrefixRun = runsArray[prefixRunsEndIndex];
    const ts = lastPrefixRun.getElementsByTagName('w:t');
    let runText = '';
    for (let j = 0; j < ts.length; j++) runText += ts[j].textContent || '';

    let beforeThisRun = accumulatedText.length - runText.length;
    let keepLengthInThisRun = prefix.length - beforeThisRun;

    let processed = 0;
    for (let j = 0; j < ts.length; j++) {
      const nodeText = ts[j].textContent || '';
      if (processed >= keepLengthInThisRun) {
        ts[j].textContent = '';
      } else if (processed + nodeText.length > keepLengthInThisRun) {
        ts[j].textContent = nodeText.substring(0, keepLengthInThisRun - processed);
      }
      processed += nodeText.length;
    }

    const doc = tcNode.ownerDocument;
    const newRun = doc.createElement('w:r');
    if (rPrClone) newRun.appendChild(rPrClone.cloneNode(true));

    const newText = doc.createElement('w:t');
    newText.setAttribute('xml:space', 'preserve');
    newText.textContent = value;
    newRun.appendChild(newText);

    p.appendChild(newRun);
  }

  static fillDateFieldPreservingTokens(tcNode, value, fieldConfig) {
    if (fieldConfig.status !== 'confirmed') throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    if (value === undefined || value === null || value === '') {
      if (fieldConfig.validation && fieldConfig.validation.rejectEmpty) throw new Error(`Value is empty`);
      return;
    }
    if (typeof value !== 'string') throw new Error('Value must be a string');

    const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = value.match(isoRegex);
    if (!match) throw new Error('Input must be YYYY-MM-DD');

    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);

    if (m < 1 || m > 12) throw new Error('Invalid month');
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) throw new Error('Invalid day');

    const yearStr = fieldConfig.format?.yearDigits === 2 ? String(y).slice(-2) : String(y);
    const monthStr = fieldConfig.format?.padMonth ? String(m).padStart(2, '0') : String(m);
    const dayStr = fieldConfig.format?.padDay ? String(d).padStart(2, '0') : String(d);

    const { yearToken, monthToken, dayToken } = fieldConfig.preserve;

    const ps = tcNode.getElementsByTagName('w:p');
    if (ps.length === 0) throw new Error('Target cell has no paragraph.');
    const p = ps[0];

    let fullText = '';
    const ts = Array.from(p.getElementsByTagName('w:t'));
    for (const t of ts) fullText += t.textContent || '';

    let yIdx = fullText.indexOf(yearToken);
    let mIdx = fullText.indexOf(monthToken, yIdx + 1);
    let dIdx = fullText.indexOf(dayToken, mIdx + 1);

    if (yIdx === -1 || mIdx === -1 || dIdx === -1) throw new Error('Tokens not fully found or in wrong order');
    if (fullText.indexOf(yearToken, yIdx + 1) !== -1 || fullText.indexOf(monthToken, mIdx + 1) !== -1 || fullText.indexOf(dayToken, dIdx + 1) !== -1) {
       throw new Error('Multiple tokens found, ambiguous');
    }

    let rPrClone = null;
    const rPrs = p.getElementsByTagName('w:rPr');
    if (rPrs.length > 0) rPrClone = rPrs[0].cloneNode(true);

    const createRun = (text) => {
      const doc = tcNode.ownerDocument;
      const run = doc.createElement('w:r');
      if (rPrClone) run.appendChild(rPrClone.cloneNode(true));
      const textNode = doc.createElement('w:t');
      textNode.setAttribute('xml:space', 'preserve');
      textNode.textContent = text;
      run.appendChild(textNode);
      return run;
    };

    let startOfPlaceholders = yIdx;
    while(startOfPlaceholders > 0 && (fullText[startOfPlaceholders - 1] === ' ' || fullText[startOfPlaceholders - 1] === '　')) {
      startOfPlaceholders--;
    }

    let currentIdx = 0;
    for (const t of ts) {
      const txt = t.textContent || '';
      let newTxt = '';
      for (let i = 0; i < txt.length; i++) {
        const char = txt[i];

        if (currentIdx === yIdx) newTxt += yearStr;
        else if (currentIdx === mIdx) newTxt += monthStr;
        else if (currentIdx === dIdx) newTxt += dayStr;

        if (char === ' ' || char === '　') {
          if (currentIdx >= startOfPlaceholders && currentIdx <= dIdx) {
            // skip space
          } else {
            newTxt += char;
          }
        } else {
          newTxt += char;
        }
        currentIdx++;
      }
      t.textContent = newTxt;
    }
  }

  static fillField(tcNode, value, fieldConfig) {
    if (fieldConfig.inputMode === 'text-preserve-prefix') {
      return this.fillTextPreservingPrefix(tcNode, value, fieldConfig);
    }
    if (fieldConfig.inputMode === 'date-preserve-tokens') {
      return this.fillDateFieldPreservingTokens(tcNode, value, fieldConfig);
    }

    if (fieldConfig.status !== 'confirmed') {
      throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    }

    const isEmpty = value === undefined || value === null || value === '';

    if (isEmpty) {
      if (fieldConfig.validation && fieldConfig.validation.rejectEmpty) {
        throw new Error(`Value is empty`);
      }
      return;
    }

    if (typeof value !== 'string') {
      throw new Error(`Value must be a string`);
    }

    if (fieldConfig.validation) {
      const val = fieldConfig.validation;

      if (val.rejectEmpty && value.trim() === '') {
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

    const runsArray = Array.from(runs);
    for (const run of runsArray) {
      targetP.removeChild(run);
    }

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
