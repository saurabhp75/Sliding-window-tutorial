# Sliding Window Protocol - TypeScript Implementation

A complete implementation of the Selective Repeat Sliding Window Protocol in TypeScript, featuring realistic network simulation with configurable packet loss, delays, and retransmissions.

## 📋 Overview

This project implements the **Selective Repeat ARQ** variant of the Sliding Window Protocol, which provides reliable data transfer over unreliable networks. The implementation includes both sender and receiver components with full window management, sequence number handling, and network condition simulation.

## ✨ Features

- **Selective Repeat ARQ**: Efficient retransmission of only lost packets
- **Configurable Window Size**: Adjustable sender/receiver windows
- **Network Simulation**: Realistic packet loss, delays, and timeouts
- **Binary Protocol**: Proper packet serialization/deserialization using ArrayBuffer
- **Flow Control**: Prevents sender from overwhelming receiver
- **Sequence Number Management**: Handles wrap-around with modulo arithmetic
- **Comprehensive Logging**: Detailed protocol operation visibility
- **Type Safety**: Full TypeScript implementation with interfaces

## 🏗️ Architecture

```
src/
├── types.ts              # Core interfaces and type definitions
├── packetUtils.ts        # Packet serialization/deserialization
├── networkSimulator.ts   # Network condition simulation
├── sender.ts            # Sender component with window management
├── receiver.ts          # Receiver component with buffering
├── slidingWindowProtocol.ts # Main protocol coordinator
└── demo.ts              # Demonstration and example usage
```

## 📦 Installation

1. **Clone or download the project files**

2. **Install dependencies** (if using Node.js)
   ```bash
   npm install typescript @types/node
   ```

3. **Compile TypeScript**
   ```bash
   npx tsc
   ```

4. **Run the demo**
   ```bash
   node demo.js
   ```

## ⚙️ Configuration

The protocol can be configured through the `NetworkConfig` interface:

```typescript
const config: NetworkConfig = {
  windowSize: 4,           # Number of packets in flight
  seqNumSize: 8,           # Sequence number space (0-7)
  timeoutMs: 1000,         # Retransmission timeout
  lossProbability: 0.3,    # Network packet loss rate (0.0-1.0)
  maxDelayMs: 200          # Maximum network delay
};
```

## 🚀 Usage

### Basic Setup

```typescript
import { SlidingWindowProtocol } from './slidingWindowProtocol';

const config = {
  windowSize: 4,
  seqNumSize: 8,
  timeoutMs: 1000,
  lossProbability: 0.2,
  maxDelayMs: 150
};

const protocol = new SlidingWindowProtocol(config);
protocol.start();

// Send data
protocol.sendData(["Hello", "World", "Data", "Packets"]);
```

### Advanced Usage

```typescript
// Monitor protocol status
setInterval(() => {
  const status = protocol.getStatus();
  console.log('Sender base:', status.senderWindow.base);
  console.log('Delivered data:', status.deliveredData);
}, 2000);

// Send data in batches
protocol.sendData(["Batch", "1"]);
setTimeout(() => protocol.sendData(["Batch", "2"]), 1000);
```

## 🔧 API Reference

### SlidingWindowProtocol

**Constructor**
- `new SlidingWindowProtocol(config: NetworkConfig)`

**Methods**
- `start(): void` - Starts the protocol simulation
- `stop(): void` - Stops the protocol and cleans up resources
- `sendData(data: string[]): void` - Sends data packets
- `getStatus(): ProtocolStatus` - Returns current protocol state

### Key Components

- **Sender**: Manages sending window, timers, and retransmissions
- **Receiver**: Handles packet reception, ACKs, and in-order delivery
- **NetworkSimulator**: Simulates network conditions and delays
- **PacketUtils**: Handles binary packet serialization

## 📊 Protocol Operation

### Normal Operation
1. Sender transmits packets within window size
2. Receiver acknowledges received packets
3. Sender slides window upon receiving ACKs
4. Receiver delivers data in order

### Error Recovery
1. **Packet Loss**: Detected via timeout, triggers retransmission
2. **Out-of-Order**: Buffered at receiver, ACKs sent for all received packets
3. **Duplicate Packets**: Ignored by receiver
4. **ACK Loss**: Handled by sender timeout and retransmission

## 🎯 Key Concepts Implemented

### Networking
- Pipelining and window-based transmission
- Sequence number management with wrap-around
- Selective Repeat ARQ error recovery
- Flow control and congestion avoidance

### TypeScript Specific
- Binary data handling with `ArrayBuffer` and `DataView`
- Packet serialization/deserialization
- Endianness management
- Type-safe interfaces

## 📝 Example Output

```
🚀 Starting Sliding Window Protocol Simulation...

📤 Sending first batch of data...
🚀 SENDER: Sending packet 0 with data: "Hello"
🚀 SENDER: Sending packet 1 with data: "World"
📦 Packet 0 LOST in network
📦 Packet 1 arrived at receiver
📨 RECEIVER: Received packet 1, expected 0
✅ RECEIVER: Sending ACK for packet 1
📦 RECEIVER: Buffered out-of-order packet 1
⏰ SENDER: Timeout for packet 0, resending...
✅ SENDER: Received ACK for packet 1
🎯 RECEIVER: Delivered data: "Hello"
🎯 RECEIVER: Delivered data: "World"
```

## 🧪 Testing

The demo includes automatic testing with configurable network conditions. You can modify the loss probability and delays in the configuration to test different scenarios:

- **Reliable network**: Set `lossProbability: 0.0`
- **High loss network**: Set `lossProbability: 0.5`
- **High latency**: Increase `maxDelayMs` and `timeoutMs`

## 🔍 Monitoring

The protocol provides comprehensive logging:
- 📦 Packet transmission and reception
- ✅ ACK processing
- ⏰ Timeout and retransmission events
- 🎯 Data delivery
- ↔️ Window sliding operations

## 📚 Learning Resources

This implementation demonstrates:
1. **Reliable Data Transfer** principles
2. **Sliding Window Protocol** mechanics
3. **Network Programming** concepts
4. **TypeScript** for systems programming
5. **Binary Protocol** design

## 🤝 Contributing

Feel free to extend this implementation with:
- Go-Back-N ARQ variant
- TCP-like congestion control
- Performance metrics and analysis
- Real network integration

## 📄 License

MIT License

Copyright (c) 2024 Sliding Window Protocol TypeScript Implementation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
