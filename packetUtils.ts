// packetUtils.ts
import { Packet } from './types';

export class PacketUtils {
  static serializePacket(packet: Packet): ArrayBuffer {
    const dataEncoder = new TextEncoder();
    const dataBytes = dataEncoder.encode(packet.data);
    
    // Packet structure: [seqNum(4B)][isAck(1B)][dataLength(4B)][data...]
    const buffer = new ArrayBuffer(9 + dataBytes.length);
    const view = new DataView(buffer);
    
    view.setUint32(0, packet.seqNum, false); // Big-endian
    view.setUint8(4, packet.isAck ? 1 : 0);
    view.setUint32(5, dataBytes.length, false);
    
    const dataArray = new Uint8Array(buffer, 9);
    dataArray.set(dataBytes);
    
    return buffer;
  }

  static deserializePacket(buffer: ArrayBuffer): Packet {
    const view = new DataView(buffer);
    const seqNum = view.getUint32(0, false);
    const isAck = view.getUint8(4) === 1;
    const dataLength = view.getUint32(5, false);
    
    const dataArray = new Uint8Array(buffer, 9, dataLength);
    const dataDecoder = new TextDecoder();
    const data = dataDecoder.decode(dataArray);
    
    return { seqNum, data, isAck };
  }

  static createDataPacket(seqNum: number, data: string): Packet {
    return { seqNum, data, isAck: false };
  }

  static createAckPacket(seqNum: number): Packet {
    return { seqNum, data: 'ACK', isAck: true };
  }
}
