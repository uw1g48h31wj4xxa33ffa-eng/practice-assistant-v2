import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { Profile } from '../types/index.js';

import baseSchema from '../schemas/base-profile.schema.json' assert { type: 'json' };
import lawSchema from '../schemas/law-profile.schema.json' assert { type: 'json' };
import formSchema from '../schemas/form-profile.schema.json' assert { type: 'json' };
import mappingSchema from '../schemas/mapping-profile.schema.json' assert { type: 'json' };
import verificationRuleSchema from '../schemas/verification-rule-profile.schema.json' assert { type: 'json' };
import documentVersionSchema from '../schemas/document-version-profile.schema.json' assert { type: 'json' };
import workflowSchema from '../schemas/workflow-profile.schema.json' assert { type: 'json' };
import aiCapabilitySchema from '../schemas/ai-capability-profile.schema.json' assert { type: 'json' };

const ajv = new Ajv2020({ strict: true });
addFormats(ajv, ['date-time']);

ajv.addSchema(baseSchema);
ajv.addSchema(lawSchema);
ajv.addSchema(formSchema);
ajv.addSchema(mappingSchema);
ajv.addSchema(verificationRuleSchema);
ajv.addSchema(documentVersionSchema);
ajv.addSchema(workflowSchema);
ajv.addSchema(aiCapabilitySchema);

export class ProfileValidator {
  static validate(profile: unknown): profile is Profile {
    if (!profile || typeof profile !== 'object') {
      throw new Error('Profile must be an object');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = profile as any;
    if (typeof p.profileType !== 'string') {
      throw new Error('Profile must have a valid profileType');
    }
    const schemaId = `https://practice-assistant.local/schemas/${p.profileType}-profile.schema.json`;
    const validate = ajv.getSchema(schemaId);
    
    if (!validate) {
      throw new Error(`Unknown profile type: ${p.profileType}`);
    }
    
    const valid = validate(profile);
    if (!valid) {
      const errors = ajv.errorsText(validate.errors);
      throw new Error(`Profile validation failed: ${errors}`);
    }
    
    return true;
  }
}
