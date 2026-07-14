import { FieldLocator } from './field-locator.mjs';

export class SdtCheckboxLocator {
  /**
   * Locate an SDT checkbox group based on mapping configuration
   */
  static locateGroup(dom, locatorConfig, selectionConfig) {
    if (locatorConfig.type !== 'sdt-checkbox-group') {
      throw new Error(`Unsupported locator type: ${locatorConfig.type}`);
    }

    const tcs = Array.from(dom.getElementsByTagName('w:tc'));
    const matchedCells = tcs.filter(tc => {
      const text = tc.textContent || '';
      return text.includes(locatorConfig.groupContextText);
    });

    if (matchedCells.length === 0) {
      throw new Error(`Group context text "${locatorConfig.groupContextText}" not found in any cell`);
    }

    if (matchedCells.length > 1) {
      throw new Error(`Group context text "${locatorConfig.groupContextText}" found in multiple cells`);
    }

    const targetCell = matchedCells[0];
    const sdts = Array.from(targetCell.getElementsByTagName('w:sdt'));
    const checkboxSdts = sdts.filter(sdt => sdt.getElementsByTagName('w14:checkbox').length > 0);

    if (checkboxSdts.length === 0) {
      throw new Error(`No SDT checkboxes found in the located group cell`);
    }
    
    if (checkboxSdts.length !== selectionConfig.options.length) {
      throw new Error(`Number of SDT checkboxes (${checkboxSdts.length}) does not match mapped options count (${selectionConfig.options.length})`);
    }

    const mappedOptions = [];
    
    // Map each option in selectionConfig to an SDT
    for (const option of selectionConfig.options) {
      let matchedSdt = null;
      let matchedCount = 0;
      
      for (const sdt of checkboxSdts) {
        if (locatorConfig.optionContextMode === 'adjacent-text') {
          // Look at the text of the parent paragraph
          let pNode = sdt.parentNode;
          while (pNode && pNode.tagName !== 'w:p') {
            pNode = pNode.parentNode;
          }
          if (pNode) {
            const pText = pNode.textContent || '';
            if (pText.includes(option.contextText)) {
              matchedSdt = sdt;
              matchedCount++;
            }
          }
        } else if (locatorConfig.optionContextMode === 'exact-match-text') {
          let pNode = sdt.parentNode;
          while (pNode && pNode.tagName !== 'w:p') {
            pNode = pNode.parentNode;
          }
          if (pNode) {
            const pText = pNode.textContent || '';
            // Remove the checkbox character (☐ or ☑) and any leading/trailing spaces
            const cleanedText = pText.replace(/^[☐☑\s　]+/, '').trim();
            if (cleanedText === option.contextText) {
              matchedSdt = sdt;
              matchedCount++;
            }
          }
        }
      }

      if (matchedCount === 0) {
        throw new Error(`Option context text "${option.contextText}" did not match any SDT checkbox`);
      }
      if (matchedCount > 1) {
        throw new Error(`Option context text "${option.contextText}" matched multiple SDT checkboxes`);
      }
      
      const checkbox = matchedSdt.getElementsByTagName('w14:checkbox')[0];
      const checkedNode = checkbox.getElementsByTagName('w14:checked')[0];
      const isChecked = checkedNode && checkedNode.getAttribute('w14:val') === '1';

      mappedOptions.push({
        value: option.value,
        sdtNode: matchedSdt,
        checked: isChecked,
        contextText: option.contextText
      });
    }

    return {
      groupLabel: locatorConfig.groupContextText,
      options: mappedOptions,
      allGroupSdts: checkboxSdts
    };
  }
}
