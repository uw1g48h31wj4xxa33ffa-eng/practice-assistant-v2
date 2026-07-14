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

    // 4. 【追加】DOM変更前に全SDTの事前検証
    for (const opt of groupInfo.options) {
      const checkbox = opt.sdtNode.getElementsByTagName('w14:checkbox')[0];
      if (!checkbox) throw new Error(`SDT for option "${opt.value}" has no w14:checkbox`);
      const content = opt.sdtNode.getElementsByTagName('w:sdtContent')[0];
      if (!content) throw new Error(`SDT for option "${opt.value}" has no w:sdtContent`);
      const checked = checkbox.getElementsByTagName('w14:checked')[0];
      if (!checked) throw new Error(`SDT for option "${opt.value}" has no w14:checked element`);
      const checkedState = checkbox.getElementsByTagName('w14:checkedState')[0];
      if (!checkedState) throw new Error(`SDT for option "${opt.value}" has no w14:checkedState`);
      const uncheckedState = checkbox.getElementsByTagName('w14:uncheckedState')[0];
      if (!uncheckedState) throw new Error(`SDT for option "${opt.value}" has no w14:uncheckedState`);
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
    } else if (selectionConfig.mode === 'multi') {
      if (!Array.isArray(value)) {
        throw new Error(`Multi selection mode requires array, got: ${typeof value}`);
      }
      
      // 重複チェック
      const unique = new Set(value);
      if (unique.size !== value.length) {
        throw new Error('Duplicate values in selection array');
      }
      
      // 全値がoptions内に存在するかDOM変更前に検証
      for (const v of value) {
        if (v === null || v === undefined || v === '') {
          throw new Error(`Empty or null value found in selection array`);
        }
        const opt = groupInfo.options.find(o => o.value === v);
        if (!opt) {
          throw new Error(`Value "${v}" is not a valid option`);
        }
      }
      
      // minSelections / maxSelections 検証（Mappingから取得）
      const minSel = selectionConfig.minSelections;
      const maxSel = selectionConfig.maxSelections;
      if (minSel !== undefined && value.length < minSel) {
        throw new Error(`Selection count ${value.length} is below minimum ${minSel}`);
      }
      if (maxSel !== undefined && value.length > maxSel) {
        throw new Error(`Selection count ${value.length} exceeds maximum ${maxSel}`);
      }
      
      // DOM変更
      for (const opt of groupInfo.options) {
        const isSelected = value.includes(opt.value);
        if (isSelected) {
          this.setCheckboxState(opt.sdtNode, true);
        } else if (selectionConfig.clearUnselected) {
          this.setCheckboxState(opt.sdtNode, false);
        }
      }
    } else {
      throw new Error(`Selection mode "${selectionConfig.mode}" is not supported`);
    }
  }

  static setCheckboxState(sdtNode, checkStatus) {
    const checkbox = sdtNode.getElementsByTagName('w14:checkbox')[0];
    if (!checkbox) {
      throw new Error('SDT node does not contain w14:checkbox element');
    }

    const content = sdtNode.getElementsByTagName('w:sdtContent')[0];
    if (!content) {
      throw new Error('SDT node does not contain w:sdtContent element');
    }

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
