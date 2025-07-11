import puppeteer from 'puppeteer';

async function testConnectivity() {
  console.log('🔄 Testing router connectivity...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Test if we can reach the router
    console.log('🌐 Testing connection to 192.168.1.1...');
    
    const response = await page.goto('http://192.168.1.1', { 
      waitUntil: 'domcontentloaded', 
      timeout: 10000 
    });
    
    console.log('✅ Connection successful!');
    console.log('Status:', response.status());
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    
    // Take a screenshot
    await page.screenshot({ path: 'connectivity-test.png' });
    console.log('📸 Screenshot saved as connectivity-test.png');
    
    // Wait 5 seconds for inspection
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Try alternative URLs
    const alternatives = [
      'http://192.168.0.1',
      'http://192.168.1.254',
      'http://10.0.0.1'
    ];
    
    for (const url of alternatives) {
      try {
        console.log(`🔄 Trying alternative: ${url}`);
        const response = await page.goto(url, { timeout: 5000 });
        console.log(`✅ Alternative working: ${url} (Status: ${response.status()})`);
        break;
      } catch (e) {
        console.log(`❌ ${url} failed`);
      }
    }
  } finally {
    await browser.close();
  }
}

testConnectivity().catch(console.error);
