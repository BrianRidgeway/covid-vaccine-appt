const debug = require( './debug' );
module.exports = async(page, config) => {
  let zipH = await page.waitForSelector( `#covid_vaccine_search_input`, { visible: true, timeout: config.pageLoadWait} );
  debug( `Entering Zip Code ${config.zipCode}` );
  await zipH.type( `${config.zipCode}`, { delay: 100 } )

  debug( `Entering Search Distance` );
  await page.click( '#fiftyMile-covid_vaccine_search', 50 );

  await page.click( `button.company-search-btn[onclick="covidVaccinationZipSearch()"]`);
  let body = await page.$('body');
  let html = await page.evaluate( n => n.innerHTML, body );
  debug( html );
  debug( `Waiting for modal to open...` );
  const attestH = await page.waitForSelector( `#attestation_1002`, { visible: true, timeout: config.pageLoadWait} );

  debug( `Attesting we're a part of a sub-group` );
  await attestH.click()

  debug( `Searching` )
  let searchH = await page.$(`button[onclick="submitAssessmentQuestions('COVID_VACCINE_SEARCH_TYPE_ZIP');"]`);

  debug( `Waiting for questions page to load` );
  searchH.click();
  await page.waitForNavigation( { timeout: config.pageLoadWait, waitUntil: "domcontentloaded" } );
  let apptTypeH = await page.waitForSelector( '#appointmentType-type', { visible: true, timeout: config.pageLoadWait} );
  debug( `Selecting appointment type` );
  //await apptTypeH.select( '#appointmentType-type', 'COVID Vaccine Dose 1 Appt' );
  await apptTypeH.select( '#appointmentType-type', 'object:60' );

  debug( `Click Start Set up` );
  let [startH] = await page.$x(`//button[text()="Start Set up"]`);
  await startH.click();

  await page.waitForSelector( `#firstDose`, { visible: true, timeout: config.pageLoadWait} );

  let [nextH] = await page.$x('//button[text()="Next"]');
  await nextH.click();

  let siteSelect = await page.$$(`select#item-type`);
  let sites = await siteSelect.$$(`option`);
  for( const site of sites ){
    const locInfo = await siteSelect.$eval( site, n => n.innerText );
    await siteSelect.select( locInfo )
    debug( `Looking at ${locInfo}` );
    await page.waitForTimeout(1000);

    let info = await page.$(`p[text()="There is no availability at this time. Please try a different search or check back later as more availability may open."]`);
    if( info ){
      console.log( info );
    }
  }
}
