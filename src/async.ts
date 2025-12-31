// Async utilities for handling timers and channels

export class Channel<T> {
  private buffer: T[] = [];
  private maxSize: number;
  private waiting: ((value: T | null) => void)[] = [];
  private closed = false;

  constructor(maxSize: number = Infinity) {
    this.maxSize = maxSize;
  }

  async put(value: T): Promise<boolean> {
    if (this.closed) return false;
    
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      resolve(value);
      return true;
    }
    
    if (this.buffer.length < this.maxSize) {
      this.buffer.push(value);
      return true;
    }
    
    // Dropping buffer: when full, remove the oldest value to make room for the new one
    if (this.maxSize !== Infinity) {
      this.buffer.shift();
      this.buffer.push(value);
      return true;
    }
    
    return false;
  }

  async take(): Promise<T | null> {
    if (this.buffer.length > 0) {
      return this.buffer.shift()!;
    }
    
    if (this.closed) return null;
    
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  close(): void {
    this.closed = true;
    this.waiting.forEach(resolve => resolve(null));
    this.waiting = [];
  }

  isClosed(): boolean {
    return this.closed;
  }
}

export function timerChannel<T>(delayFn: () => number, msg: T): Channel<T> {
  // create a channel which emits a message every (delayFn) milliseconds
  const out = new Channel<T>();
  
  function loop() {
    if (!out.isClosed()) {
      out.put(msg);
      setTimeout(loop, delayFn());
    }
  }
  
  setTimeout(loop, delayFn());
  return out;
}

export async function takeFor<T>(input: Channel<T>, timeMs: number): Promise<T[]> {
  // returns all values from channel until timeMs elapses
  const result: T[] = [];
  const deadline = Date.now() + timeMs;
  
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    
    const timeoutPromise = new Promise<null>(resolve => 
      setTimeout(() => resolve(null), remaining)
    );
    
    const value = await Promise.race([
      input.take(),
      timeoutPromise
    ]);
    
    if (value === null) break;
    result.push(value);
  }
  
  return result;
}

export function chunkedChannel<T>(input: Channel<T>, timeMs: number): Channel<T[]> {
  // returns an output channel which emits one array of values for each unit of time
  const out = new Channel<T[]>();
  
  async function loop() {
    while (!input.isClosed() && !out.isClosed()) {
      const chunk = await takeFor(input, timeMs);
      if (chunk.length > 0) {
        await out.put(chunk);
      }
    }
  }
  
  loop();
  return out;
}
