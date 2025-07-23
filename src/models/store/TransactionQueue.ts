// TransactionQueue.ts
// FIFO queue for resource-affecting actions (atomic, robust)

export type TransactionFn<T> = () => Promise<T>;

class TransactionQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;

  // Queue a transaction and return a promise for its result
  public queueResourceTransaction<T>(fn: TransactionFn<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrapped = async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      this.queue.push(wrapped);
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const next = this.queue.shift();
    if (next) {
      try {
        await next();
      } finally {
        this.processing = false;
        // Process the next transaction in the queue
        this.processNext();
      }
    } else {
      this.processing = false;
    }
  }
}

export const transactionQueue = new TransactionQueue(); 