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
}
