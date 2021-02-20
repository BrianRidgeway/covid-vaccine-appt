const puppeteer = require( 'puppeteer' );
const ua = require( 'random-useragent' );
const fs = require( 'fs' );
const debug = require( './src/debug' );

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
  if( cfg.pageLoadWait === undefined ){
    cfg.pageLoadWait = 5000;
  }
  return cfg;
}

const giant = async(page) => {
  let giantStatus = await page.$eval( '#divApptTypeInfo0', n => n.innerText)
  if( giantStatus.match( /There are currently no COVID-19 vaccine appointments available/) ){
    debug( `GIANT - ${giantStatus}` );
  }
  else{
    console.log( 'Giant has appointments!' );
    console.log( giantStatus );
  }
}

const cvs = async(page) => {
  debug( `Click on ${config.state} link...` );
  await page.click( `a[data-modal="vaccineinfo-${config.state}"]`);

  debug( `Waiting for modal to open...` );
  const modalEH = await page.waitForSelector( `#vaccineinfo-${config.state}`, { visible: true, timeout: config.pageLoadWait} );

  debug( `Reading the modal availability table...` );
  const statusRecords = await modalEH.$$('div.covid-status > table > tbody > tr');
  for( const siteInfo of statusRecords ){
    const cityName = await siteInfo.$eval( 'span.city', n => n.innerText);
    const cityStatus = await siteInfo.$eval( 'span.status', n => n.innerText);
    if( cityStatus != "Fully Booked" ){
      console.log( `CVS - ${cityName}: ${cityStatus}` );
    }
    debug( `CVS - ${cityName}: ${cityStatus}` );

  };
}

const vaccinate = async() => {
  let browser, page, urls;
  try {
    debug( "Opening a browser..." );
    browser = await puppeteer.launch( config.puppeteer );

    if( Array.isArray( config.url ) ){
      urls = config.url;
    }
    else{
      urls = [ config.url ];
    }
    for( const url of urls ){
      debug( "Browser open. Opening a page..." );
      page = await browser.newPage();
      debug( "Page opened" );
      //let agent = ua.getRandom( (ua) => { return ua.browserName === 'Firefox' });
      let agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0';
      debug( `Setting UA ${agent}...` );
      await page.setUserAgent( agent );

      let waitTime = Math.floor( Math.random() * config.maxWait )
      debug( `Waiting ${waitTime}ms...` );
      await page.waitForTimeout( waitTime );
      debug( `Goto page ${url}` );
      await page.goto( url, {waitUntil: 'domcontentloaded', timeout: config.pageLoadWait});

      if( url.match( /cvs/i ) ){
        await cvs(page);
      }
      else if( url.match( /giant/i ) ){
        await giant(page);
      }
      await page.close();
    }
  } catch(e){
    console.log(`ERROR: ${e}`);
    let body = await page.$('body');
    if( body ){
      let html = await page.evaluate( n => n.outerHTML, body );
      console.log( html );
    }
    await page.close();
  } finally {
    await browser.close();
  }
}

const config = setConfig();
vaccinate();

