export class SdtCheckboxFiller {
  /**
   * Fill SDT checkbox group safely
   */
  static fillGroup(groupInfo, value, selectionConfig, status) {
    if (status !== 'confirmed') {
      throw new Error(`Input value "${value}" is not confirmed`);
    }

    if (value === null || value === undefined || value === '') {
      throw new Error(`Value is empty`);
    }

    if (selectionConfig.mode === 'single') {
      if (Array.isArray(value)) {
        throw new Error(`Single selection mode received array: ${value}`);
      }
      
      const targetOption = groupInfo.options.find(opt => opt.value === value);
      if (!targetOption) {
        throw new Error(`Target value "${value}" is not a valid option`);
      }
      
      // Update check states
      for (const opt of groupInfo.options) {
        if (opt === targetOption) {
          this.setCheckboxState(opt.sdtNode, true);
        } else if (selectionConfig.clearUnselected) {
          this.setCheckboxState(opt.sdtNode, false);
        }
      }
    } else {
      throw new Error(`Selection mode "${selectionConfig.mode}" is not yet implemented`);
    }
  }

  static setCheckboxState(sdtNode, checkStatus) {
    const checkbox = sdtNode.getElementsByTagName('w14:checkbox')[0];
    if (!checkbox) return;

    let checked = checkbox.getElementsByTagName('w14:checked')[0];
    if (!checked) {
      // Create if it doesn't exist, though usually it does
      checked = sdtNode.ownerDocument.createElementNS('http://schemas.microsoft.com/office/word/2010/wordml', 'w14:checked');
      checkbox.insertBefore(checked, checkbox.firstChild);
    }
    
    // Set w14:val
    checked.setAttribute('w14:val', checkStatus ? '1' : '0');
    
    // Synchronize sdtContent
    const stateDef = checkbox.getElementsByTagName(checkStatus ? 'w14:checkedState' : 'w14:uncheckedState')[0];
    if (stateDef) {
      const font = stateDef.getAttribute('w14:font');
      const val = stateDef.getAttribute('w14:val');
      
      if (font && val) {
        const content = sdtNode.getElementsByTagName('w:sdtContent')[0];
        if (content) {
          const rPrs = Array.from(content.getElementsByTagName('w:rPr'));
          for (const rPr of rPrs) {
            const rFonts = rPr.getElementsByTagName('w:rFonts')[0];
            if (rFonts) {
              rFonts.setAttribute('w:ascii', font);
              rFonts.setAttribute('w:eastAsia', font);
              rFonts.setAttribute('w:hAnsi', font);
            }
          }
          
          const ts = Array.from(content.getElementsByTagName('w:t'));
          if (ts.length > 0) {
            ts[0].textContent = String.fromCharCode(parseInt(val, 16));
          }
        }
      }
    }
  }
}
