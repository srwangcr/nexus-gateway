interface User {
    id: string;
    email: string;
    role: string;
    permissions: [];
}

interface AuthenticatedRequest extends Request {
    user?: User;
    clientIP: string;
    requestId: string;
}

interface RateLimitInfo {
    limit: number;
    remainin: number;
    reset: number;
    retryAfter?: number;
}
interface ProxyOptions{
    target: string;
    timeout: number;
    retries: number;
    headers: Record<string, string>;
}
export { User, AuthenticatedRequest, RateLimitInfo, ProxyOptions}

