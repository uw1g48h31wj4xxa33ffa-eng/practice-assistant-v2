export class WordFiller {
  static fillField(tcNode, value, fieldConfig) {
    if (fieldConfig.status !== 'confirmed') {
      throw new Error(`Cannot fill value. Status is not 'confirmed'`);
    }
    if (fieldConfig.validation?.maxLength && value.length > fieldConfig.validation.maxLength) {
      throw new Error(`Value exceeds max length`);
    }

    const ps = tcNode.getElementsByTagName('w:p');
    if (ps.length === 0) throw new Error('Target cell has no paragraph.');
    const targetP = ps[0];
    
    const doc = tcNode.ownerDocument;
    const runs = targetP.getElementsByTagName('w:r');
    
    let targetRun = null;
    for (let i = 0; i < runs.length; i++) {
      const texts = runs[i].getElementsByTagName('w:t');
      if (texts.length === 0) {
        // Empty run found
        targetRun = runs[i];
        break;
      }
    }
    
    if (targetRun) {
      const newText = doc.createElement('w:t');
      newText.setAttribute('xml:space', 'preserve');
      newText.textContent = value;
      targetRun.appendChild(newText);
    } else {
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
