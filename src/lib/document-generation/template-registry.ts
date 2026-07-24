export type TemplateRegistryEntry = {
  templateId: string;
  formProfileId: string;
  mappingProfileId: string;
  templateSource: string;
  expectedSha256: string;
  activeFrom: string;
  activeTo?: string;
};

// Hardcoded for Phase 4 prototype. In production, this might come from a DB.
const templates: TemplateRegistryEntry[] = [
  {
    templateId: 'hatarakikata-r8-form1',
    formProfileId: 'hatarakikata-r8-form1',
    mappingProfileId: 'hatarakikata-r8-form1-map1',
    templateSource: process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001687895.docx',
    expectedSha256: 'b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8',
    activeFrom: '2024-04-01T00:00:00Z'
  },
  {
    templateId: 'career-up-r8-form1',
    formProfileId: 'career-up-r8-form1',
    mappingProfileId: 'career-up-map1',
    templateSource: process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001688046.docx',
    expectedSha256: 'some-hash-here-if-needed',
    activeFrom: '2024-04-01T00:00:00Z'
  }
];

export class TemplateRegistry {
  static getTemplate(templateId: string, effectiveDateStr: string): TemplateRegistryEntry {
    const entry = templates.find(t => t.templateId === templateId);
    if (!entry) {
      throw new Error(`UNKNOWN_TEMPLATE: Template not found for id ${templateId}`);
    }

    const effectiveDate = new Date(effectiveDateStr);
    const activeFrom = new Date(entry.activeFrom);
    
    if (effectiveDate < activeFrom) {
      throw new Error(`INACTIVE_TEMPLATE: Template ${templateId} is not active yet on ${effectiveDateStr}`);
    }

    if (entry.activeTo) {
      const activeTo = new Date(entry.activeTo);
      if (effectiveDate > activeTo) {
        throw new Error(`INACTIVE_TEMPLATE: Template ${templateId} expired on ${entry.activeTo}`);
      }
    }

    return entry;
  }
}
