// sender.ts
import { Packet, WindowState, NetworkConfig } from './types';
import { PacketUtils } from './packetUtils';

export class Sender {
  private window: WindowState = {
    base: 0,
    nextSeqNum: 0,
    buffer: new Map(),
    acknowledged: new Set()
  };

  private timers: Map<number, NodeJS.Timeout> = new Map();
  private dataBuffer: string[] = [];
  private onAckCallback?: (seqNum: number) => void;
  private onTimeoutCallback?: (seqNum: number) => void;

  constructor(
    private config: NetworkConfig,
    private sendPacket: (packet: Packet) => void
  ) {}

  setCallbacks(onAck: (seqNum: number) => void, onTimeout: (seqNum: number) => void): void {
    this.onAckCallback = onAck;
    this.onTimeoutCallback = onTimeout;
  }

  sendData(data: string): boolean {
    if (this.dataBuffer.length > 10) { // Simple backpressure
      return false;
    }

    this.dataBuffer.push(data);
    this.processDataBuffer();
    return true;
  }

  private processDataBuffer(): void {
    while (this.dataBuffer.length > 0 && this.canSendNewPacket()) {
      const data = this.dataBuffer.shift()!;
      this.sendNewPacket(data);
    }
  }

  private canSendNewPacket(): boolean {
    const windowUsed = (this.window.nextSeqNum - this.window.base + this.config.seqNumSize) % this.config.seqNumSize;
    return windowUsed < this.config.windowSize;
  }

  private sendNewPacket(data: string): void {
    const seqNum = this.window.nextSeqNum;
    const packet = PacketUtils.createDataPacket(seqNum, data);
    
    this.window.buffer.set(seqNum, packet);
    this.startTimer(seqNum);
    
    console.log(`🚀 SENDER: Sending packet ${seqNum} with data: "${data}"`);
    this.sendPacket(packet);
    
    this.window.nextSeqNum = (this.window.nextSeqNum + 1) % this.config.seqNumSize;
  }

  receiveAck(ackPacket: Packet): void {
    if (!ackPacket.isAck) return;

    const seqNum = ackPacket.seqNum;
    console.log(`✅ SENDER: Received ACK for packet ${seqNum}`);

    // Check if this ACK is within our window
    if (this.isInWindow(seqNum)) {
      this.window.acknowledged.add(seqNum);
      this.clearTimer(seqNum);
      
      // Slide window if possible
      this.slideWindow();
      
      // Try to send more data from buffer
      this.processDataBuffer();
      
      this.onAckCallback?.(seqNum);
    }
  }

  private isInWindow(seqNum: number): boolean {
    if (this.window.base <= seqNum && seqNum < this.window.base + this.config.windowSize) {
      return true;
    }
    
    // Handle wrap-around
    if (this.window.base + this.config.windowSize > this.config.seqNumSize) {
      return seqNum >= 0 && seqNum < (this.window.base + this.config.windowSize) % this.config.seqNumSize;
    }
    
    return false;
  }

  private slideWindow(): void {
    while (this.window.acknowledged.has(this.window.base)) {
      this.window.acknowledged.delete(this.window.base);
      this.window.buffer.delete(this.window.base);
      this.window.base = (this.window.base + 1) % this.config.seqNumSize;
      console.log(`↔️ SENDER: Window slid to base ${this.window.base}`);
    }
  }

  private startTimer(seqNum: number): void {
    this.clearTimer(seqNum);
    
    const timer = setTimeout(() => {
      console.log(`⏰ SENDER: Timeout for packet ${seqNum}, resending...`);
      const packet = this.window.buffer.get(seqNum);
      if (packet) {
        this.sendPacket(packet);
        this.startTimer(seqNum); // Restart timer
      }
      this.onTimeoutCallback?.(seqNum);
    }, this.config.timeoutMs);

    this.timers.set(seqNum, timer);
  }

  private clearTimer(seqNum: number): void {
    const timer = this.timers.get(seqNum);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(seqNum);
    }
  }

  getWindowState(): WindowState {
    return { ...this.window };
  }

  destroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}
