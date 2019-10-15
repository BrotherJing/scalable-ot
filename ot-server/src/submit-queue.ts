import SubmitRequest from "./submit-request";

class SubmitQueue {
  public queues: {[key: string]: SubmitRequest[]};
  constructor() {
    this.queues = {};
  }

  public submit(docId: string, req: SubmitRequest) {
    const queue = this.getQueue_(docId);
    queue.push(req);
    if (queue.length === 1) {
      this.consume_(docId);
    }
  }

  private async consume_(docId: string) {
    const queue = this.getQueue_(docId);
    const req = queue[0];
    await req.submit();
    queue.shift();
    if (queue.length > 0) {
      this.consume_(docId);
    }
  }

  private getQueue_(docId: string) {
    this.queues[docId] = this.queues[docId] || [];
    return this.queues[docId];
  }
}

export default SubmitQueue;
