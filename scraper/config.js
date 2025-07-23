// Scraper Configuration
// Update these values to match your router's settings

export const SCRAPER_CONFIG = {
  // Router connection settings
  ROUTER_IP: '192.168.1.1',  // Change this to your router's IP address
  LOGIN_URL: 'http://192.168.1.1/index.html',
  STATION_LIST_URL: 'http://192.168.1.1/reqproc/proc_get?cmd=station_list&isTest=false',
  
  // Router login credentials
  USERNAME: 'admin',  // Change this to your router's admin username
  PASSWORD: 'camodem',  // Change this to your router's admin password
  
  // Connection settings
  TIMEOUT: 30000,  // 30 seconds
  HEADLESS: true,   // Set to false for debugging
  
  // Demo mode - set to true to use mock data instead of real router
  DEMO_MODE: true,  // Set to false when you have a real router configured
  
  // Mock data for demo mode
  MOCK_MAC_ADDRESSES: [
    '00:11:22:33:44:55',  // John Doe's MAC
    '00:11:22:33:44:56',  // Sarah Wilson's MAC
    'AA:BB:CC:DD:EE:FF',  // Additional mock device
    '12:34:56:78:90:AB'   // Another mock device
  ]
};

// Instructions for configuration:
// 1. Find your router's IP address (usually 192.168.1.1 or 192.168.0.1)
// 2. Update ROUTER_IP, LOGIN_URL, and STATION_LIST_URL accordingly
// 3. Set the correct USERNAME and PASSWORD for your router
// 4. Set DEMO_MODE to false when you have real router access
// 5. The STATION_LIST_URL may need to be adjusted based on your router model
