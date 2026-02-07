import { EventEmitter } from 'events';

// Simple in-memory queue for when Redis is not available
class LocalQueue extends EventEmitter {
  private jobs: any[] = [];
  private name: string;
  private processor: ((job: any) => Promise<void>) | null = null;

  constructor(name: string) {
    super();
    this.name = name;
  }

  async add(name: string, data: any, options: any = {}) {
    const job = { id: Math.random().toString(36).substring(7), name, data, options };
    
    if (options.delay) {
      setTimeout(() => this.processJob(job), options.delay);
    } else {
      setImmediate(() => this.processJob(job));
    }
    
    return job;
  }

  setProcessor(processor: (job: any) => Promise<void>) {
    this.processor = processor;
  }

  private async processJob(job: any) {
    if (this.processor) {
      try {
        await this.processor(job);
        this.emit('completed', job);
      } catch (err) {
        this.emit('failed', job, err);
      }
    }
  }
}

export const localEmailQueue = new LocalQueue('email-queue');
