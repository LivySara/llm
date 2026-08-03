// events.ts
// 服务端 → 客户端 的事件总线。每个连接一个自增 seq。
// 设计要点：事件有 seq，客户端据此检测丢帧；事件不会「静默失败」——要么到达要么被记录。
//
// Phase 练习升级：从「全局广播」改为「按 sessionKey 分组的定向投递」。
//   - ChannelRegistry：按 sessionKey 保存订阅者（每个 channel 一份）。
//   - EventBus：subscribe 时指定要加入的 sessionKey；publish 时只投递给同一 sessionKey 的订阅者。
//     这样不同 sessionKey 的连接彼此隔离，互不收到对方的 session.message。

export interface EventFrame {
  event: string;
  seq: number;
  payload: unknown;
}

export type Subscriber = (frame: EventFrame) => void;

// 按 sessionKey 分组的订阅表：channel 隔离的基础数据结构。
export class ChannelRegistry {
  private channels = new Map<string, Set<Subscriber>>();

  // 让一个订阅者加入指定 sessionKey 的 channel，返回退订函数。
  join(sessionKey: string, fn: Subscriber): () => void {
    let set = this.channels.get(sessionKey);
    if (!set) {
      set = new Set();
      this.channels.set(sessionKey, set);
    }
    set.add(fn);
    return () => {
      set?.delete(fn);
    };
  }

  // 把一帧投递给指定 sessionKey 的所有订阅者（无订阅者则静默丢弃，而非广播）。
  deliver(sessionKey: string, frame: EventFrame): void {
    const set = this.channels.get(sessionKey);
    if (!set) return;
    for (const fn of set) fn(frame);
  }
}

export class EventBus {
  private seq = 0;
  // 注入 ChannelRegistry，便于测试时替换为mock；默认自带一个。
  constructor(private registry: ChannelRegistry = new ChannelRegistry()) {}

  // 订阅某个 sessionKey 对应的 channel（连接握手后调用）。
  subscribe(sessionKey: string, fn: Subscriber): () => void {
    return this.registry.join(sessionKey, fn);
  }

  // 定向发布：只投递给 join 了同一 sessionKey 的订阅者。
  publish(sessionKey: string, event: string, payload: unknown): void {
    const frame: EventFrame = { event, seq: ++this.seq, payload };
    this.registry.deliver(sessionKey, frame);
  }
}
