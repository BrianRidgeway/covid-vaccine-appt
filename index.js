const puppeteer = require( 'puppeteer' );
const ua = require( 'random-useragent' );
const fs = require( 'fs' );

const setConfig = () => {
  let rawConfig = fs.readFileSync( './config.json' );
  let cfg = JSON.parse( rawConfig );
  if( cfg.url === undefined ){
    throw new Error( "'url' is a required configuration parameter" );
  }
  if( cfg.state === undefined ){
    throw new Error( "'state' is a required configuration parameter" );
  }
  if( cfg.puppeteer === undefined ){
    cfg.puppeteer = {};
  }
  if( cfg.maxWait === undefined ){
    cfg.maxWait = 0;
  }
  return cfg;
}

const vaccinate = async() => {
  let browser;
  try {
    browser = await puppeteer.launch( config.puppeteer );
    let page = await browser.newPage();
    let agent = ua.getRandom();
    await page.setUserAgent( agent );
    let waitTime = Math.floor( Math.random() * config.maxWait )
      await page.waitForTimeout( waitTime );
    await page.goto( config.url, {waitUntil: 'load'});
    await page.click( `a[data-modal="vaccineinfo-${config.state}"]`);
    const modalEH = await page.waitForSelector( `#vaccineinfo-${config.state}`, { visible: true} );
    const statusRecords = await modalEH.$$('div.covid-status > table > tbody > tr');
    for( const siteInfo of statusRecords ){
      const cityName = await siteInfo.$eval( 'span.city', n => n.innerText);
      const cityStatus = await siteInfo.$eval( 'span.status', n => n.innerText);
      if( cityStatus != "Fully Booked" ){
        console.log( cityName + ": " + cityStatus );
      }
    };
  } catch(e){
    console.log(`ERROR: ${e}`);
  } finally {
    await browser.close();
  }
}

const config = setConfig();
vaccinate();

