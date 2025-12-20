import { getInvestigationLogger } from './server/services/investigationLogger.js';
const logger = getInvestigationLogger('test-session');
logger.info('test', 'Test log message');
logger.close();
console.log('Logger test complete');
