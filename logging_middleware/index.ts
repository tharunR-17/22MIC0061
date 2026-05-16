export type LogStack = 'backend' | 'frontend';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogPackage = 
  | 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service'
  | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style'
  | 'auth' | 'config' | 'middleware' | 'utils'; 

let authToken: string = '';


export const initLogger = (token: string) => {
    authToken = token;
};

export const Log = async (stack: LogStack, level: LogLevel, pkg: LogPackage, message: string): Promise<void> => {
    if (!authToken) {
        console.warn("Logger: Token not initialized. Call initLogger(token) first.");
        return;
    }

    try {
        const response = await fetch('http://4.224.186.213/evaluation-service/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                stack: stack,
                level: level,
                package: pkg,
                message: message
            })
        });

        if (!response.ok) {
            console.error(`Logger: Failed to push log. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Logger: Network error occurred while sending log.", error);
    }
};