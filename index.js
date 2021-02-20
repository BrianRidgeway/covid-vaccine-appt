const puppeteer = require( 'puppeteer' );
const ua = require( 'random-useragent' );
const setConfig = require( './src/config' );
const debug = require( './src/debug' );
const parsers = {
  giant: require( './src/giant' ),
  cvs: require( './src/cvs' )
};

const config = setConfig();

const retry = async(page, url, counter) => {
  if( counter === undefined ){
    counter = 1;
  }
  try {
    await page.goto( url, {waitUntil: 'domcontentloaded', timeout: config.pageLoadWait});
  } catch(e){
    if( e.match( /^TimeoutError/ && counter < 10 ) ){
      counter++;
      debug( `Request to ${url} timed out, trying again (attempt ${counter})` );
      retry( page, url, counter );
    }
    else{
      throw new Error( e );
    }
  };
}

const findAppointments = async() => {
  let browser, page, urls;
  try {
    debug( "Opening a browser..." );
    browser = await puppeteer.launch( config.puppeteer );

    for( const site of config.sites ){
      debug( "Browser open. Opening a page..." );
      page = await browser.newPage();
      debug( "Page opened" );
      let agent = ua.getRandom( (ua) => { return ua.browserName === 'Firefox' });
      debug( `Setting UA ${agent}...` );
      await page.setUserAgent( agent );

      let waitTime = Math.floor( Math.random() * config.maxWait )
      debug( `Waiting ${waitTime}ms...` );
      await page.waitForTimeout( waitTime );
      debug( `Goto ${site.name} page ${site.url}` );

      await retry( page, site.url )

      await parsers[site.name]( page, config );
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

findAppointments();

