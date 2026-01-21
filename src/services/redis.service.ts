import Redis from 'ioredis';
interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
}

interface Logger {
    log: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
}

class RedisService {
    private client: Redis | null;
    private config: RedisConfig;
    private isConnected: boolean;
    private reconnectAttempts: number;
    private logger: Console;



    constructor(config: RedisConfig, logger?: Console) {
        this.config = config;
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.logger = logger || console;
    }

    private ensureConnected(): void {
        if (!this.isConnected || !this.client) {
            throw new Error('Redis is not connected');
        }
    }

    private handleError(operation: string, error: unknown): never {
        this.logger.error(`Error ${operation}:`, error);
        throw error;
    }

    public async connect(): Promise<void> {
        try {
            this.client = new Redis({
                host: this.config.host,
                port: this.config.port,
                password: this.config.password,
                db: this.config.db,
                lazyConnect: true,
            });

            this.client.on('connect', () => {
                this.logger.log('Redis connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            });
            
            this.client.on('error', (err) => {
                this.logger.error('Redis connection error:', err);
                this.isConnected = false;
            });

            this.client.on('close', () => {
                this.logger.warn('Redis connection closed');
                this.isConnected = false;
            });

            this.client.on('reconnecting', () => {
                this.reconnectAttempts += 1;
                this.logger.log(`Redis reconnecting (attempt ${this.reconnectAttempts})`);
            });

            this.client.on('ready', () => {
                this.logger.log('Redis is ready to use');
            });

            await this.client.connect(); 
            this.logger.log('Redis connection established');
        } catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            this.isConnected = false;
            this.logger.log('Redis disconnected');
        }
    }

    private validateKey(key: string): void {
        if (!key || key.trim() === '') {
            throw new Error('Key cannot be empty');
        }
    }

    public async get(key: string): Promise<string | null> {
        this.validateKey(key);
        this.ensureConnected();
        try {
            return await this.client!.get(key);
        } catch (error) {
            this.handleError('getting key from Redis', error);
        }
    }

    public async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
        this.validateKey(key);  // ✅ Agregar
        this.ensureConnected();
        try {
            if (expirationSeconds) {
                await this.client.set(key, value, 'EX', expirationSeconds);
            } else {
                await this.client.set(key, value);
            }
        } catch (error) {
            this.handleError('setting key in Redis', error);
        }
    }

    public async increment(key: string): Promise<number> {
        this.validateKey(key);  
        this.ensureConnected();
        try {
            return await this.client.incr(key);
        } catch (error) {
            this.handleError('incrementing key in Redis', error);
        }
    }

    public async decrement(key: string): Promise<number> {
        this.validateKey(key);
        this.ensureConnected();
        try {
            return await this.client!.decr(key);
        } catch (error) {
            this.handleError('decrementing key in Redis', error);
        }
    }

    public async delete(key: string): Promise<number> {
        this.validateKey(key); 
        this.ensureConnected();
        try {
            return await this.client.del(key);
        } catch (error) {
            this.handleError('deleting key from Redis', error);
        }
    }

    public async exists(key: string): Promise<boolean> {
        this.validateKey(key);
        this.ensureConnected();
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            this.handleError('checking existence of key in Redis', error);
        }
    }

    public async expire(key: string, seconds: number): Promise<boolean> {
        this.validateKey(key);
        this.ensureConnected();
        try {
            const result = await this.client.expire(key, seconds);
            return result === 1;
        } catch (error) {
            this.handleError('setting expiration for key in Redis', error);
        }
    }

    public async ttl(key: string): Promise<number> {
        this.validateKey(key); 
        this.ensureConnected();
        try {
            return await this.client.ttl(key);
        } catch (error) {
            this.handleError('getting TTL for key in Redis', error);
        }
    }   

    public async getHash(key: string, field: string): Promise<string | null> {
        this.validateKey(key);
        this.ensureConnected();
        try {
            return await this.client.hget(key, field);
        } catch (error) {
            this.handleError('getting hash field from Redis', error);
        }
    }

    public async setHash(key: string, field: string, value: string): Promise<void> {
        this.validateKey(key);
        this.ensureConnected();
        try {
            await this.client.hset(key, field, value);
        } catch (error) {
            this.handleError('setting hash field in Redis', error);
        }
    }

    public async ping(): Promise<string> {
        this.ensureConnected();
        try {
            return await this.client.ping();
        } catch (error) {
            this.handleError('pinging Redis', error);
        }
    }    
}

let redisServiceInstance: RedisService | null = null;

function getRedisService(config?: RedisConfig): RedisService {
    if (!redisServiceInstance) {
        if (!config) {
            throw new Error('Config is required to create RedisService instance');
        }
        redisServiceInstance = new RedisService(config);
    }
    return redisServiceInstance;
}
function resetRedisService(): void {
    if (redisServiceInstance) {
        redisServiceInstance.disconnect();
    }
    redisServiceInstance = null;
}
export { RedisService, getRedisService, resetRedisService };