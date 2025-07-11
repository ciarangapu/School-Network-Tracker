import puppeteer from 'puppeteer';

const MODEM_URL = 'http://192.168.1.1/index.html';

async function debugLogin() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    console.log('🌐 Navigating to:', MODEM_URL);
    await page.goto(MODEM_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('📄 Page loaded successfully');
    console.log('Title:', await page.title());
    console.log('URL:', page.url());

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    // Look for all forms on the page
    const forms = await page.$$eval('form', forms => 
      forms.map(form => ({
        id: form.id,
        action: form.action,
        method: form.method
      }))
    );
    console.log('📋 Forms found:', forms);

    // Look for all input fields
    const inputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder
      }))
    );
    console.log('🔍 Input fields found:', inputs);

    // Look for all buttons
    const buttons = await page.$$eval('button, input[type="submit"], input[type="button"]', buttons => 
      buttons.map(button => ({
        id: button.id,
        name: button.name,
        type: button.type,
        textContent: button.textContent?.trim(),
        value: button.value
      }))
    );
    console.log('🔘 Buttons found:', buttons);

    // Take a screenshot
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-login-page.png');

    console.log('\n⏳ Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugLogin().catch(console.error);
