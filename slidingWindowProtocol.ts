// slidingWindowProtocol.ts
import { Sender } from './sender';
import { Receiver } from './receiver';
import { NetworkSimulator } from './networkSimulator';
import { Packet, NetworkConfig } from './types';

export class SlidingWindowProtocol {
  private sender: Sender;
  private receiver: Receiver;
  private network: NetworkSimulator;
  private isRunning = false;

  constructor(private config: NetworkConfig) {
    this.network = new NetworkSimulator(config);
    
    this.sender = new Sender(config, (packet: Packet) => {
      this.network.sendPacket(packet, 'sender');
    });
    
    this.receiver = new Receiver((packet: Packet) => {
      this.network.sendPacket(packet, 'receiver');
    });

    this.setupCallbacks();
  }

  private setupCallbacks(): void {
    this.sender.setCallbacks(
      (seqNum: number) => {
        console.log(`🎉 ACK callback for packet ${seqNum}`);
      },
      (seqNum: number) => {
        console.log(`🚨 Timeout callback for packet ${seqNum}`);
      }
    );
  }

  start(): void {
    this.isRunning = true;
    this.runSimulationLoop();
  }

  stop(): void {
    this.isRunning = false;
    this.sender.destroy();
  }

  sendData(data: string[]): void {
    data.forEach(chunk => {
      if (!this.sender.sendData(chunk)) {
        console.log(`⚠️ Data buffer full, dropping: "${chunk}"`);
      }
    });
  }

  private runSimulationLoop(): void {
    if (!this.isRunning) return;

    // Process network events (50ms time steps)
    const arrivedPackets = this.network.processTime(50);

    // Deliver arrived packets to their destinations
    arrivedPackets.forEach(packet => {
      if (packet.isAck) {
        this.sender.receiveAck(packet);
      } else {
        this.receiver.receivePacket(packet);
      }
    });

    // Continue simulation
    setTimeout(() => this.runSimulationLoop(), 50);
  }

  getStatus(): any {
    return {
      senderWindow: this.sender.getWindowState(),
      receiverExpectedSeq: this.receiver.getExpectedSeqNum(),
      deliveredData: this.receiver.getDeliveredData()
    };
  }
}
