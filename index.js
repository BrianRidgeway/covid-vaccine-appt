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
  let page;
  try {
    if( process.env.DEBUG ){
      console.log( "Opening a browser..." );
    }
    browser = await puppeteer.launch( config.puppeteer );


    if( process.env.DEBUG ){
      console.log( "Browser open. Opening a page..." );
    }
    page = await browser.newPage();
    if( process.env.DEBUG ){
      console.log( "Page opened" );
    }
    //let agent = ua.getRandom( (ua) => { return ua.browserName === 'Firefox' });
    let agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0';
    if( process.env.DEBUG ){
      console.log( `Setting UA ${agent}...` );
    }
    await page.setUserAgent( agent );
    let waitTime = Math.floor( Math.random() * config.maxWait )
    if( process.env.DEBUG ){
      console.log( `Waiting ${waitTime}ms...` );
    }
    await page.waitForTimeout( waitTime );

    if( process.env.DEBUG ){
      console.log( `Goto page ${config.url}...` );
    }
    await page.goto( config.url, {waitUntil: 'domcontentloaded', timeout: 5000});

    if( process.env.DEBUG ){
      console.log( `Click on ${config.state} link...` );
    }
    await page.click( `a[data-modal="vaccineinfo-${config.state}"]`);

    if( process.env.DEBUG ){
      console.log( `Waiting for modal to open...` );
    }
    const modalEH = await page.waitForSelector( `#vaccineinfo-${config.state}`, { visible: true, timeout: 5000} );

    if( process.env.DEBUG ){
      console.log( `Reading the modal availability table...` );
    }
    const statusRecords = await modalEH.$$('div.covid-status > table > tbody > tr');
    for( const siteInfo of statusRecords ){
      const cityName = await siteInfo.$eval( 'span.city', n => n.innerText);
      const cityStatus = await siteInfo.$eval( 'span.status', n => n.innerText);
      if( cityStatus != "Fully Booked" ){
        console.log( cityName + ": " + cityStatus );
      }
      if( process.env.DEBUG ){
        console.log( `${cityName}: ${cityStatus}` );
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

