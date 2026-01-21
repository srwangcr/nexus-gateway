interface RouteConfig { // create a interface routing configuration
    
    path: String; // Endpoint path
    target: String; // Endpount target URL
    methods : String[]; // Allowed HTTP methods
    requiresAuth: Boolean;
    rateLimit: {
        windowMs: Number; // Time window in milliseconds
        maxRequests: Number; // Max requests per window
    };
}

interface GatewayConfig { // create a interface gateway configuration
    port: number; // Gateway listening port
    routes: RouteConfig[]; // Array of route configurations
    timeout:number; // Request timeout in milliseconds
    retries: number; // Number of retry attempts for failed requests
}

const gatewayConfig: GatewayConfig = { // create a gateway configuration object
    port: Number(process.env.GATEWAY_PORT) ?? 3000, // Default to port 3000 if not specified
    timeout: Number(process.env.GATEWAY_TIMEOUT) ?? 30000, // Default to 30 seconds
    retries: Number(process.env.GATEWAY_RETRIES) ?? 3, // Default to 3 retries
    routes: [ // Define route configurations
        {
            path: '/api/users', // Users service endpoint
            target: 'http://users-service:3001', // Target URL for users service
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
            requiresAuth: true,// Authentication required
            rateLimit: { // Rate limiting configuration
                windowMs: 60000, // 1 minute window
                maxRequests: 100, // Max 100 requests per window
            }, 
        },
        {
            path: '/api/products', // Products service endpoint
            target: 'http://products-service:3002', // Target URL for products service
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
            requiresAuth: true, // Authentication required
            rateLimit: { // Rate limiting configuration
                windowMs: 60000, // 1 minute window
                maxRequests: 100, // Max 100 requests per window
            },
        },
        {
            path: '/api/orders', // Orders service endpoint
            target: 'http://orders-service:3003', // Target URL for orders service
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
            requiresAuth: true, // Authentication required
            rateLimit: {
                windowMs: 60000, // 1 minute window
                maxRequests: 100, // Max 100 requests per window
            },
        },
    ],
};

export default gatewayConfig; // export the gateway configuration object
