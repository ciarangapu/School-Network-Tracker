import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Network Diagnostics for Router Connection');
console.log('==========================================\n');

try {
  // Get network configuration
  console.log('📡 Checking network configuration...');
  const { stdout: ipconfig } = await execAsync('ipconfig');
  
  // Extract potential router IPs (default gateways)
  const gatewayMatches = ipconfig.match(/Default Gateway[.\s]*:\s*(\d+\.\d+\.\d+\.\d+)/g);
  
  if (gatewayMatches) {
    console.log('🏠 Found potential router IP addresses:');
    gatewayMatches.forEach((match, index) => {
      const ip = match.match(/(\d+\.\d+\.\d+\.\d+)/)[1];
      console.log(`   ${index + 1}. ${ip}`);
    });
  }
  
  // Test connectivity to common router IPs
  const commonRouterIPs = ['192.168.1.1', '192.168.0.1', '10.0.0.1', '192.168.2.1'];
  
  console.log('\n🔍 Testing connectivity to common router IPs...');
  
  for (const ip of commonRouterIPs) {
    try {
      const { stdout } = await execAsync(`ping -n 1 -w 1000 ${ip}`);
      if (stdout.includes('Reply from')) {
        console.log(`✅ ${ip} - REACHABLE`);
      } else {
        console.log(`❌ ${ip} - NOT REACHABLE`);
      }
    } catch (error) {
      console.log(`❌ ${ip} - NOT REACHABLE`);
    }
  }
  
  // Get current IP and network info
  console.log('\n💻 Your current network information:');
  const currentIP = ipconfig.match(/IPv4 Address[.\s]*:\s*(\d+\.\d+\.\d+\.\d+)/);
  if (currentIP) {
    console.log(`   Your IP: ${currentIP[1]}`);
  }
  
  console.log('\n💡 Recommendations:');
  console.log('   1. Make sure you are connected to your router\'s WiFi network');
  console.log('   2. Use one of the REACHABLE IP addresses above as your router IP');
  console.log('   3. Try opening the router IP in your browser to confirm it\'s accessible');
  
} catch (error) {
  console.error('❌ Error running network diagnostics:', error.message);
}
