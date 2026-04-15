import { LoggerOptions } from 'pino';

export const pinoConfig = (): LoggerOptions => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    level: isProd ? 'info' : 'debug',
    transport: !isProd
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  };
};
