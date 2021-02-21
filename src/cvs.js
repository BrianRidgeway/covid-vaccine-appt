const debug = require( './debug' );
module.exports = async(page, config) => {
  debug( `Click on ${config.state} link...` );
  await page.click( `a[data-modal="vaccineinfo-${config.state}"]`);

  debug( `Waiting for modal to open...` );
  const modalEH = await page.waitForSelector( `#vaccineinfo-${config.state}`, { visible: true, timeout: config.pageLoadWait} );

  debug( `Reading the modal availability table...` );
  const statusRecords = await modalEH.$$('div.covid-status > table > tbody > tr');
  let results = "";
  for( const siteInfo of statusRecords ){
    const cityName = await siteInfo.$eval( 'span.city', n => n.innerText);
    const cityStatus = await siteInfo.$eval( 'span.status', n => n.innerText);
    if( cityStatus != "Fully Booked" ){
      results += `CVS - ${cityName}: ${cityStatus}\n`;
    }
    debug( `CVS - ${cityName}: ${cityStatus}` );
  };
  return results;
}
