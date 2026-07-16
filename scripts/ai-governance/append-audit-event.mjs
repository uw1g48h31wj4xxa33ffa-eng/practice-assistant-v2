import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUDIT_LOG_PATH = path.resolve(__dirname, '../../docs/AI/05_Audit_Log.jsonl');

/**
 * Validates the audit event object
 * @param {Object} event
 */
function validateEvent(event) {
  const requiredKeys = [
    'eventId',
    'timestamp',
    'actorType',
    'actorId',
    'provider',
    'model',
    'action',
    'target',
    'requestId',
    'beforeHash',
    'afterHash',
    'evidenceHash',
    'approvalStatus',
    'result',
    'reason'
  ];

  for (const key of requiredKeys) {
    if (!(key in event)) {
      throw new Error(`Missing required key: ${key}`);
    }
  }

  // Very basic JSON validation ensuring it's an object and can be stringified
  try {
    JSON.stringify(event);
  } catch {
    throw new Error('Event is not a valid JSON object');
  }
}

/**
 * Appends an audit event to the log file.
 * Creates the file if it doesn't exist.
 * @param {Object} event
 */
export async function appendAuditEvent(event) {
  validateEvent(event);
  
  const eventLine = JSON.stringify(event) + '\n';
  
  try {
    await fs.appendFile(AUDIT_LOG_PATH, eventLine, 'utf8');
    return true;
  } catch (error) {
    throw new Error(`Failed to append to audit log: ${error.message}`);
  }
}

// Allow running from CLI
if (process.argv[1] === __filename) {
  const jsonArg = process.argv[2];
  if (!jsonArg) {
    console.error('Usage: node append-audit-event.mjs \'<json_event_string>\'');
    process.exit(1);
  }
  
  try {
    const event = JSON.parse(jsonArg);
    appendAuditEvent(event)
      .then(() => {
        console.log('Successfully appended audit event.');
        process.exit(0);
      })
      .catch((e) => {
        console.error(e.message);
        process.exit(1);
      });
  } catch (e) {
    console.error('Failed to parse JSON argument:', e.message);
    process.exit(1);
  }
}
