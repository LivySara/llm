// events.ts
// 服务端 → 客户端 的事件总线。每个连接一个自增 seq。
// 设计要点：事件有 seq，客户端据此检测丢帧；事件不会「静默失败」——要么到达要么被记录。
// 当前是全局广播；练习点见 session.send.ts（改成按 sessionKey 分组投递）。

export interface EventFrame {
  event: string;
  seq: number;
  payload: unknown;
}

export type Subscriber = (frame: EventFrame) => void;

export class EventBus {
  private seq = 0;
  private subscribers = new Set<Subscriber>();

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    return () => {
      this.subscribers.delete(fn);
    };
  }

  publish(event: string, payload: unknown): void {
    const frame: EventFrame = { event, seq: ++this.seq, payload };
    for (const fn of this.subscribers) fn(frame);
  }
}
