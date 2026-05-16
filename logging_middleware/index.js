"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.initLogger = void 0;
let authToken = '';
const initLogger = (token) => {
    authToken = token;
};
exports.initLogger = initLogger;
const Log = async (stack, level, pkg, message) => {
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
    }
    catch (error) {
        console.error("Logger: Network error occurred while sending log.", error);
    }
};
exports.Log = Log;
