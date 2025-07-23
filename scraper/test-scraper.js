import MacScraper from './scraper.js';

console.log('🧪 Testing MAC Address Scraper');
console.log('================================');

const scraper = new MacScraper();

try {
  console.log('🔍 Starting scraper test...');
  const result = await scraper.scrapeMACs();
  
  console.log('\n✅ Scraping completed successfully!');
  console.log('📊 Results:');
  console.log(`   Timestamp: ${result.timestamp}`);
  console.log(`   Total MAC addresses found: ${result.count}`);
  
  if (result.macAddresses.length > 0) {
    console.log('\n📋 MAC Addresses found:');
    result.macAddresses.forEach((mac, index) => {
      console.log(`   ${index + 1}. ${mac}`);
    });
  } else {
    console.log('\n⚠️ No MAC addresses found!');
  }
  
} catch (error) {
  console.error('\n❌ Scraping failed:');
  console.error(`   Error: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
} finally {
  await scraper.close();
  console.log('\n🔒 Browser closed');
  process.exit(0);
}
