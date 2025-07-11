import puppeteer from 'puppeteer';

const MODEM_URL = 'http://192.168.1.1/index.html';
const STATION_LIST_URL = 'http://192.168.1.1/reqproc/proc_get?cmd=station_list&isTest=false';

const USERNAME = 'admin';  
const PASSWORD = 'camodem';

class MacScraper {
  constructor() {
    this.browser = null;
    this.isRunning = false;
  }

  async initialize(headless = true) {
    console.log(`🚀 Launching browser (headless: ${headless})...`);
    this.browser = await puppeteer.launch({ 
      headless: headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
  }

  async scrapeMACs() {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();

    try {
      console.log('🌐 Navigating to modem login page...');
      // 1. Go to login page
      await page.goto(MODEM_URL, { waitUntil: 'networkidle2', timeout: 30000 });

      // Debug: Check if we're on the right page
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);

      // Wait for login form to be visible
      console.log('⏳ Waiting for login form...');
      await page.waitForSelector('#login_input_username', { timeout: 10000 });
      
      // 2. Fill in username and password fields
      console.log('📝 Filling in credentials...');
      await page.type('#login_input_username', USERNAME);
      await page.type('#login_input_password', PASSWORD);

      // Debug: Check if login button exists and get its selector
      const loginButtonSelectors = [
        '#login_button',
        'button[type="submit"]',
        'input[type="submit"]',
        '.login-button',
        '[name="login"]',
        'button',
        'input[value*="Login"]',
        'input[value*="Sign"]',
        'form button',
        'form input[type="submit"]'
      ];

      let loginButton = null;
      let usedSelector = null;

      for (const selector of loginButtonSelectors) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            loginButton = elements[0];
            usedSelector = selector;
            console.log(`✅ Found login button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!loginButton) {
        // If no button found, try form submission
        console.log('⚠️ No explicit login button found. Trying form submission...');
        try {
          await page.keyboard.press('Enter');
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
          console.log('✅ Logged in via form submission');
        } catch (navError) {
          console.log('❌ Form submission failed. Checking page content...');
          const content = await page.content();
          console.log('Page HTML snippet:', content.substring(0, 1000));
          throw new Error('Login button not found and form submission failed');
        }
      } else {
        // 3. Click login button and wait for navigation
        console.log(`🖱️ Clicking login button (${usedSelector})...`);
        try {
          await Promise.all([
            loginButton.click(),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
          ]);
          console.log('✅ Logged in successfully');
        } catch (clickError) {
          console.log('⚠️ Click failed, trying alternative method...');
          await loginButton.focus();
          await page.keyboard.press('Enter');
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
          console.log('✅ Logged in via keyboard');
        }
      }

      // 4. Navigate to the station list page
      await page.goto(STATION_LIST_URL, { waitUntil: 'networkidle2', timeout: 30000 });

      // 5. Get page content (raw response)
      const content = await page.content();

      // 6. Extract MAC addresses using regex
      const macRegex = /([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g;
      const macs = content.match(macRegex) || [];

      console.log(`\n✅ Found ${macs.length} connected MAC addresses`);
      
      return {
        timestamp: new Date().toISOString(),
        macAddresses: macs,
        count: macs.length
      };
    } catch (err) {
      console.error('❌ Scraping error:', err);
      throw err;
    } finally {
      await page.close();
    }
  }

  async startPeriodicScraping(intervalMinutes = 15, callback) {
    if (this.isRunning) {
      console.log('⚠️ Scraping already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting periodic scraping every ${intervalMinutes} minutes`);

    const scrapeAndProcess = async () => {
      try {
        const result = await this.scrapeMACs();
        if (callback) {
          await callback(result);
        }
      } catch (error) {
        console.error('❌ Periodic scraping error:', error);
      }
    };

    // Initial scrape
    await scrapeAndProcess();

    // Set up interval
    this.intervalId = setInterval(scrapeAndProcess, intervalMinutes * 60 * 1000);
  }

  stopPeriodicScraping() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Stopped periodic scraping');
  }

  async close() {
    this.stopPeriodicScraping();
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default MacScraper;

// Main execution when running the file directly
async function main() {
  const scraper = new MacScraper();
  
  // Check for debug mode (run with --debug flag)
  const isDebugMode = process.argv.includes('--debug');
  
  try {
    console.log('🔄 Starting MAC address scraper...');
    if (isDebugMode) {
      console.log('🐛 Debug mode enabled - browser will be visible');
      await scraper.initialize(false); // non-headless for debugging
    }
    
    // Test single scrape first
    const result = await scraper.scrapeMACs();
    console.log('\n📊 Scraping Results:');
    console.log('Timestamp:', result.timestamp);
    console.log('MAC Addresses found:', result.macAddresses);
    console.log('Total count:', result.count);
    
    if (!isDebugMode) {
      // Start periodic scraping (every 15 minutes) only in normal mode
      await scraper.startPeriodicScraping(15, (data) => {
        console.log(`\n📊 [${new Date().toLocaleTimeString()}] Periodic scan complete`);
        console.log(`Found ${data.count} MAC addresses`);
        data.macAddresses.forEach((mac, index) => {
          console.log(`  ${index + 1}. ${mac}`);
        });
      });
      
      // Keep the process running
      console.log('\n✅ Scraper is running. Press Ctrl+C to stop.');
    } else {
      console.log('\n🐛 Debug mode complete. Closing browser...');
      await scraper.close();
    }
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
      await scraper.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
      await scraper.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Scraper failed:', error.message);
    await scraper.close();
    process.exit(1);
  }
}

// Run main function if this file is executed directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   main().catch(console.error);
// }

// Alternative check for Windows paths
// const currentFile = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
// const scriptFile = process.argv[1];
// if (currentFile === scriptFile || process.argv[1].endsWith('scraper.js')) {
//   main().catch(console.error);
// }

// Direct execution for testing
main().catch(console.error);