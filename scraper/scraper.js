import puppeteer from 'puppeteer';

const MODEM_URL = 'http://192.168.1.1/index.html';
const STATION_LIST_URL = 'http://192.168.1.1/reqproc/proc_get?cmd=station_list&isTest=false';

const USERNAME = 'admin';  
const PASSWORD = 'camodem';

class MacScraper {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.consecutiveFailures = 0;
    this.maxConsecutiveFailures = 5; // Stop trying after 5 consecutive failures
    this.circuitBreakerOpen = false;
    this.lastSuccessTime = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
  }

  async scrapeMACs(retryCount = 0) {
    const maxRetries = 3;
    
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();

    try {
      console.log(`🔍 Attempting to scrape MACs (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // 1. Go to login page
      await page.goto(MODEM_URL, { waitUntil: 'networkidle2' });

      // 2. Fill in username and password fields
      await page.type('#login_input_username', USERNAME);
      await page.type('#login_input_password', PASSWORD);

      // 3. Click login button and wait for navigation
      await Promise.all([
        page.click('#login_button'),
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
      ]);

      console.log('✅ Logged in successfully');

      // 4. Navigate to the station list page
      await page.goto(STATION_LIST_URL, { waitUntil: 'networkidle2' });

      // 5. Get page content (raw response)
      const content = await page.content();

      // 6. Extract MAC addresses using regex
      const macRegex = /([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g;
      const macs = content.match(macRegex) || [];

      console.log(`\n✅ Found ${macs.length} connected MAC addresses`);
      
      // Log each MAC address found
      if (macs.length > 0) {
        console.log('📋 MAC Addresses Found:');
        macs.forEach((mac, index) => {
          console.log(`   ${index + 1}. ${mac}`);
        });
      } else {
        console.log('⚠️ No MAC addresses found in page content');
        // Log a sample of the page content to debug
        console.log('📄 Sample page content (first 500 chars):');
        console.log(content.substring(0, 500));
      }
      
      return {
        timestamp: new Date().toISOString(),
        macAddresses: macs,
        count: macs.length
      };
      
    } catch (err) {
      console.error(`❌ Scraping error (attempt ${retryCount + 1}):`, err.message);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying in 5 seconds... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        await page.close(); // Close current page
        return this.scrapeMACs(retryCount + 1); // Retry
      } else {
        console.error('❌ Max retries reached, giving up on this attempt');
        throw err;
      }
    } finally {
      if (page && !page.isClosed()) {
        await page.close();
      }
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
      // Circuit breaker logic
      if (this.circuitBreakerOpen) {
        const timeSinceLastTry = Date.now() - this.lastFailureTime;
        const cooldownTime = 15 * 60 * 1000; // 15 minutes cooldown
        
        if (timeSinceLastTry < cooldownTime) {
          console.log(`🔧 Circuit breaker open - cooling down for ${Math.round((cooldownTime - timeSinceLastTry) / 60000)} more minutes`);
          return;
        } else {
          console.log('🔧 Circuit breaker reset - attempting to reconnect');
          this.circuitBreakerOpen = false;
          this.consecutiveFailures = 0;
        }
      }

      try {
        const result = await this.scrapeMACs();
        
        // Success - reset failure counter
        this.consecutiveFailures = 0;
        this.circuitBreakerOpen = false;
        this.lastSuccessTime = Date.now();
        
        if (callback) {
          await callback(result);
        }
        console.log('✅ Periodic scraping completed successfully');
      } catch (error) {
        this.consecutiveFailures++;
        this.lastFailureTime = Date.now();
        
        console.error(`❌ Periodic scraping error (failure ${this.consecutiveFailures}/${this.maxConsecutiveFailures}):`, error.message);
        
        // Open circuit breaker after too many failures
        if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
          this.circuitBreakerOpen = true;
          console.log('🔧 Circuit breaker opened - too many consecutive failures. Will retry after cooldown period.');
        } else {
          console.log(`⏳ Will try again in the next interval (${this.maxConsecutiveFailures - this.consecutiveFailures} attempts remaining before circuit breaker)`);
        }
      }
    };

    // Initial scrape
    console.log('🎯 Running initial scrape...');
    await scrapeAndProcess();

    // Set up interval - this will continue running even if individual scrapes fail
    this.intervalId = setInterval(async () => {
      console.log('⏰ Running scheduled scrape...');
      await scrapeAndProcess();
    }, intervalMinutes * 60 * 1000);
    
    console.log('✅ Periodic scraping scheduler started with circuit breaker protection');
  }

  stopPeriodicScraping() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Stopped periodic scraping');
  }

  isConnected() {
    return this.browser && this.browser.isConnected();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      isConnected: this.isConnected(),
      circuitBreakerOpen: this.circuitBreakerOpen,
      consecutiveFailures: this.consecutiveFailures,
      lastSuccessTime: this.lastSuccessTime,
      lastFailureTime: this.lastFailureTime
    };
  }

  resetCircuitBreaker() {
    console.log('🔧 Manually resetting circuit breaker');
    this.circuitBreakerOpen = false;
    this.consecutiveFailures = 0;
    this.lastFailureTime = null;
  }

  async getDevices() {
    // This is a simplified version - in reality you might need to parse the router's device list
    const scrapedData = await this.scrapeMACs();
    return scrapedData.macAddresses.map(mac => ({
      macAddress: mac,
      connectionTime: new Date(),
      status: 'connected'
    }));
  }

  async close() {
    this.stopPeriodicScraping();
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('🔒 Browser closed successfully');
      } catch (error) {
        console.error('❌ Error closing browser:', error.message);
      }
      this.browser = null;
    }
  }
}

export default MacScraper;