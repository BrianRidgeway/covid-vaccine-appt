const puppeteer = require( 'puppeteer' );
const ua = require( 'random-useragent' );
const setConfig = require( './src/config' );
const debug = require( './src/debug' );
const pid = require( './src/pid' );
const parsers = {
  giant: require( './src/giant' ),
  cvs: require( './src/cvs' )
};
const log = require( './src/log' );

const config = setConfig();
let browser, page, urls;

const searchSite = async(site) => {
  const siteStartTs = new Date().toLocaleString();
  log( `START: (${site.name}) ${siteStartTs}` )
  try {
    debug( "Opening a browser" );
    browser = await puppeteer.launch( config.puppeteer );
    debug( "Opening a page..." );
    page = await browser.newPage();
    debug( "Page opened" );
    let agent = ua.getRandom( (ua) => { return ua.browserName === 'Firefox' });
    debug( `Setting UA ${agent}...` );
    await page.setUserAgent( agent );

    debug( `Goto ${site.name} page ${site.url}` );
    await page.goto( site.url, {waitUntil: 'domcontentloaded', timeout: config.pageLoadWait});

    let results = await parsers[site.name]( page, config );
    if( results === "" ){
      log( `${site.name}: no appointments found` );
    }
    else{
      log( `${site.name}: appointments found\n${results}` );
    }
    await page.close();
    await browser.close();
  } catch(e){
    log( e );
    await page.close();
  } finally {
    await browser.close();
    const siteEndTs = new Date().toLocaleString();
    log( `END: (${site.name}) ${siteEndTs}\n\n` );
  };
}

const findAppointments = async() => {
  for( const site of config.sites ){
    if( site.name != 'safeway' ){
      await searchSite(site);
    }
  }
  pid.deletePid();
}
pid.createPid();
findAppointments();

