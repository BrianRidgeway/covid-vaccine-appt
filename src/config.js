const fs = require( 'fs' );
module.exports = () => {
  let rawConfig = fs.readFileSync( './config.json' );
  let cfg = JSON.parse( rawConfig );
  if( cfg.sites === undefined ){
    throw new Error( "'sites' is a required configuration parameter" );
  }
  if( ! Array.isArray(cfg.sites) ){
    throw new Error( "'sites' must be an array of { name => 'site', url => 'url' }" );
  }
  for( const site of cfg.sites ){
    if( site.name === undefined || site.url === undefined ){
      throw new Error( "'sites' must be an array of { name => 'site', url => 'url' }" );
    }
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
