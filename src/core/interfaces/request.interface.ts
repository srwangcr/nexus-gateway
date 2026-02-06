import type { Request } from 'express';

interface User {
    id: string;
    email: string;
    role: string;
    permissions: string[];
}

interface AuthenticatedRequest extends Request {
    user?: User;
    clientIp?: string;
    requestId?: string;
}

interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}

interface ProxyOptions {
    target: string;
    timeout: number;
    retries: number;
    headers: Record<string, string>;
}

export { User, AuthenticatedRequest, RateLimitInfo, ProxyOptions };

