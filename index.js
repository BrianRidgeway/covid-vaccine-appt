const puppeteer = require( 'puppeteer' );
const ua = require( 'random-useragent' );
const fs = require( 'fs' );

const config = JSON.parse( fs.readFileSync( './config.json' ) );

const vaccinate = async() => {
	let browser = await puppeteer.launch( config.puppeteer );
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
	await browser.close();
}

vaccinate();

