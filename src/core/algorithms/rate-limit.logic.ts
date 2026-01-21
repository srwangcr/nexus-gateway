function calculateExponentialBackoff(attempt: number): number {
        const baseTime = 100; // base time in milliseconds
        const maxJitter = 100; // max jitter in milliseconds
        const backoffTime = baseTime * Math.pow(2, attempt); // exponential backoff
        const jitter = Math.floor(Math.random() * maxJitter); // random jitter
        return backoffTime + jitter; // total backoff time with jitter
        }

class TokenBucket { // Token Bucket rate limiting algorithm
    capacity: number; // maximum number of tokens
    tokens: number; // current number of tokens
    refillRate: number; // tokens added per second
    lastRefill: number; // timestamp of last refill
    constructor(capacity: number, refillRate: number){ //   initialize the token bucket
        this.capacity = capacity; // maximum number of tokens
        this.refillRate = refillRate; // tokens added per second
        this.tokens = capacity; // start full
        this.lastRefill = Date.now(); // current timestamp
    }
    public refill() {
        const now = Date.now(); // current timestamp
        const elapsed = (now - this.lastRefill) / 1000; // time elapsed in seconds
        const tokensToAdd = elapsed * this.refillRate; // tokens to add
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd); // update tokens with cap at capacity
        this.lastRefill = now; // update last refill timestamp
    }
    public consume(tokens = 1) { // consume tokens from the bucket
        this.refill(); // refill tokens before consuming
        if (this.tokens >= tokens) { // check if enough tokens are available
            this.tokens -= tokens; // consume tokens
            return true; // allow the request
        } else { // not enough tokens
            return false; // reject the request
        }
    }
}
class SlidingWindow { // Sliding Window rate limiting algorithm
    limit: number; // max requests allowed
    window: number; // window size in seconds
    requests: Map<string, number[]>; // map of client ID to array of request timestamps
    constructor(limit: number, window: number) { // initialize the sliding window
        this.limit = limit; // max requests allowed
        this.window = window; // window size in seconds
        this.requests = new Map(); // initialize the requests map
    } // check if a request is allowed
    public isAllowed(clientId: string): boolean { // check if a request is allowed
        const now = Date.now(); // current timestamp
        const windowStart = now - this.window * 1000; // calculate window start time
        if (!this.requests.has(clientId)) { // initialize request array for new client
            this.requests.set(clientId, []); // set empty array
        } // filter out timestamps outside the window
        const timestamps = this.requests.get(clientId)!.filter(timestamp => timestamp > windowStart); // keep only recent timestamps
        if (timestamps.length < this.limit) { // check if under limit
            timestamps.push(now); // add current timestamp
            this.requests.set(clientId, timestamps); // update the requests map
            return true; // allow the request
        } else { // exceed limit
            return false; // reject the request
        }
    }
    public getRemainingTime(clientId: string): number { // get remaining time until next allowed request
        const now = Date.now(); // current timestamp
        const timestamps = this.requests.get(clientId) || []; // get request timestamps
        if (timestamps.length === 0) { // no requests made
            return 0; // no wait time
        } // calculate time until the oldest request exits the window
        const oldestTimestamp = timestamps[0]; // get oldest timestamp
        const timePassed = now - oldestTimestamp; // time passed since oldest request
        const remainingTime = this.window * 1000 - timePassed; // remaining time in milliseconds
        return Math.max(0, Math.ceil(remainingTime / 1000)); // return in seconds

}
}
export { TokenBucket, SlidingWindow, calculateExponentialBackoff }; // export the classes and function
