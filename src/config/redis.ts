interface RedisConfig { // create a interface redis configuration
    host: string; // Redis server host
    port: number; // Redis server port
    password?: string // Redis server password (optional)
    db: number; // Redis database index
    maxRetriesPerRequest: number; // Maximum number of retries per request
    enableReadyCheck: boolean; // Enable ready check on connection
    retryStrategy: (times: number) => number | null; // Retry strategy function
}
const redisConfig: RedisConfig = { // create a redis configuration object
    host: process.env.REDIS_HOST ?? 'localhost', // Default to localhost if not specified
    port: Number(process.env.REDIS_PORT) || 6379, // Default to port 6379
    password: process.env.REDIS_PASSWORD || undefined, // No default password
    db: 0, // Use default database 0
    maxRetriesPerRequest: 3, // Retry up to 3 times per request
    enableReadyCheck: true, // Enable ready check
    retryStrategy: (times: number) => { // Define retry strategy
        const delay = Math.min(times * 50, 2000); // Exponential backoff with max delay of 2000ms
        return delay; // Return delay in milliseconds
    }
}

export default redisConfig; // export the redis configuration object

