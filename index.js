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
  if( cfg.pageLoadWait === undefined ){
    cfg.pageLoadWait = 5000;
  }
  return cfg;
}

const giant = async(page) => {
  let giantStatus = await page.$eval( '#divApptTypeInfo0', n => n.innerText);
  if( giantStatus.match( /There are currently no COVID-19 vaccine appointments available/) ){
    if( process.env.DEBUG ){
      console.log( `GIANT - ${giantStatus}` );
    }
  }
  else{
    console.log( 'Giant has appointments!' );
    console.log( giantStatus );
  }
}

const cvs = async(page) => {
  if( process.env.DEBUG ){
    console.log( `Click on ${config.state} link...` );
  }
  await page.click( `a[data-modal="vaccineinfo-${config.state}"]`);

  if( process.env.DEBUG ){
    console.log( `Waiting for modal to open...` );
  }
  const modalEH = await page.waitForSelector( `#vaccineinfo-${config.state}`, { visible: true, timeout: config.pageLoadWait} );

  if( process.env.DEBUG ){
    console.log( `Reading the modal availability table...` );
  }
  const statusRecords = await modalEH.$$('div.covid-status > table > tbody > tr');
  for( const siteInfo of statusRecords ){
    const cityName = await siteInfo.$eval( 'span.city', n => n.innerText);
    const cityStatus = await siteInfo.$eval( 'span.status', n => n.innerText);
    if( cityStatus != "Fully Booked" ){
      console.log( `CVS - ${cityName}: ${cityStatus}` );
    }
    if( process.env.DEBUG ){
      console.log( `CVS - ${cityName}: ${cityStatus}` );
    }

  };
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
    let urls;
    if( Array.isArray( config.url ) ){
      urls = config.url;
    }
    else{
      urls = [ config.url ];
    }
    for( const url of urls ){
      if( process.env.DEBUG ){
        console.log( `Goto page ${url}` );
      }
      await page.goto( url, {waitUntil: 'domcontentloaded', timeout: config.pageLoadWait});

      if( url.match( /cvs/i ) ){
        await cvs(page);
      }
      else if( url.match( /giant/i ) ){
        await giant(page);
      }
    }
  } catch(e){
    console.log(`ERROR: ${e}`);
  } finally {
    await browser.close();
  }
}

const config = setConfig();
vaccinate();

