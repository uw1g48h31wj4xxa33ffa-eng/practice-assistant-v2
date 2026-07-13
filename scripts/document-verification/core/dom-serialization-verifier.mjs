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
      dottedBorderCount: dottedBorderCount
    };
  }
}
