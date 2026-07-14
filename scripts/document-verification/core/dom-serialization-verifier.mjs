export class DomSerializationVerifier {
  static verify(originalDocumentDom, serializedDocumentDom) {
    const originalCounts = this.getStructuralCounts(originalDocumentDom);
    const serializedCounts = this.getStructuralCounts(serializedDocumentDom);

    for (const [key, originalValue] of Object.entries(originalCounts)) {
      if (serializedCounts[key] !== originalValue) {
         throw new Error(`DOM Serialization altered structure: ${key} changed from ${originalValue} to ${serializedCounts[key]}`);
      }
    }
  }

  static getStructuralCounts(dom) {
    let dottedBorderCount = 0;
    const borders = dom.getElementsByTagName('w:bottom');
    for (let i = 0; i < borders.length; i++) {
       if (borders[i].getAttribute('w:val') === 'dotted') {
           dottedBorderCount++;
       }
    }

    const sdtIds = Array.from(dom.getElementsByTagName('w:id')).map(n => n.getAttribute('w:val')).sort().join(',');
    const sdtAliases = Array.from(dom.getElementsByTagName('w:alias')).map(n => n.getAttribute('w:val')).sort().join(',');
    const sdtTags = Array.from(dom.getElementsByTagName('w:tag')).map(n => n.getAttribute('w:val')).sort().join(',');

    return {
      tableCount: dom.getElementsByTagName('w:tbl').length,
      rowCount: dom.getElementsByTagName('w:tr').length,
      cellCount: dom.getElementsByTagName('w:tc').length,
      paragraphCount: dom.getElementsByTagName('w:p').length,
      sectionCount: dom.getElementsByTagName('w:sectPr').length,
      vMergeCount: dom.getElementsByTagName('w:vMerge').length,
      gridSpanCount: dom.getElementsByTagName('w:gridSpan').length,
      headerReferenceCount: dom.getElementsByTagName('w:headerReference').length,
      footerReferenceCount: dom.getElementsByTagName('w:footerReference').length,
      pgSzCount: dom.getElementsByTagName('w:pgSz').length,
      pgMarCount: dom.getElementsByTagName('w:pgMar').length,
      dottedBorderCount: dottedBorderCount,
      sdtCount: dom.getElementsByTagName('w:sdt').length,
      sdtPrCount: dom.getElementsByTagName('w:sdtPr').length,
      sdtContentCount: dom.getElementsByTagName('w:sdtContent').length,
      checkboxCount: dom.getElementsByTagName('w14:checkbox').length,
      checkedCount: dom.getElementsByTagName('w14:checked').length,
      checkedStateCount: dom.getElementsByTagName('w14:checkedState').length,
      uncheckedStateCount: dom.getElementsByTagName('w14:uncheckedState').length,
      sdtIds,
      sdtAliases,
      sdtTags
    };
  }
}
