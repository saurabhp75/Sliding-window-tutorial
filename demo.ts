// demo.ts
import { SlidingWindowProtocol } from './slidingWindowProtocol';
import { NetworkConfig } from './types';

// Configuration for the sliding window protocol
const config: NetworkConfig = {
  windowSize: 4,
  seqNumSize: 8, // Sequence numbers 0-7
  timeoutMs: 1000,
  lossProbability: 0.3, // 30% packet loss
  maxDelayMs: 200
};

// Create and start the protocol
const protocol = new SlidingWindowProtocol(config);

// Send some test data
const testData = [
  "Hello", "World", "Sliding", "Window", 
  "Protocol", "TypeScript", "Implementation"
];

console.log("🚀 Starting Sliding Window Protocol Simulation...\n");
protocol.start();

// Send data in chunks to demonstrate the protocol
setTimeout(() => {
  console.log("\n📤 Sending first batch of data...");
  protocol.sendData(testData.slice(0, 4));
}, 100);

setTimeout(() => {
  console.log("\n📤 Sending second batch of data...");
  protocol.sendData(testData.slice(4));
}, 2000);

// Display status periodically
setInterval(() => {
  const status = protocol.getStatus();
  console.log("\n=== PROTOCOL STATUS ===");
  console.log(`Sender Window: base=${status.senderWindow.base}, nextSeqNum=${status.senderWindow.nextSeqNum}`);
  console.log(`Receiver Expected: ${status.receiverExpectedSeq}`);
  console.log(`Delivered Data: [${status.deliveredData.join(', ')}]`);
  console.log("======================\n");
}, 3000);

// Stop after 10 seconds
setTimeout(() => {
  console.log("🛑 Stopping simulation...");
  protocol.stop();
  process.exit(0);
}, 10000);
