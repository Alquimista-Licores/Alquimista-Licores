import { getAuditData } from './src/lib/audit.functions';

async function test() {
  try {
    const data = await getAuditData();
    console.log('AUDIT_RESULT:', JSON.stringify(data));
  } catch (e) {
    console.error('AUDIT_ERROR:', e);
  }
}

test();
