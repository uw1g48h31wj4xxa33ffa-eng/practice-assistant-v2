import fs from 'node:fs';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export class WordDocument {
  constructor(buffer) {
    this.originalBuffer = buffer;
    this.zip = new PizZip(buffer);
    
    // Prevent DOMParser from logging warnings to stdout/stderr in test output
    this.domParser = new DOMParser({
      onError: (level, msg) => {
        if (level === 'warning') return;
        throw new Error(`XML Parse ${level}: ${msg}`);
      }
    });
    this.xmlSerializer = new XMLSerializer();
    
    this.documentXmlStr = this.zip.file('word/document.xml')?.asText();
    if (!this.documentXmlStr) {
      throw new Error('word/document.xml not found in ZIP');
    }
    
    this.documentDom = this.domParser.parseFromString(this.documentXmlStr, 'text/xml');
  }

  static fromFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    return new WordDocument(buffer);
  }

  getDocumentDom() {
    return this.documentDom;
  }

  getOriginalBuffer() {
    return this.originalBuffer;
  }

  save(outputPath) {
    const serializedXml = this.xmlSerializer.serializeToString(this.documentDom);
    this.zip.file('word/document.xml', serializedXml);
    const buf = this.zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(outputPath, buf);
  }

  getZip() {
    return this.zip;
  }
}
