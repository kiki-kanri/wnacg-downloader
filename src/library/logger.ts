import format from 'date-fns/format';
import colorLogger from 'node-color-log';

colorLogger.setDate(() => format(new Date(), 'yyyy-MM-dd HH:mm:ss'));

export const logger = colorLogger;
export default logger;
