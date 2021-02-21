const fs = require( 'fs' );
const debug = require( './debug' );
module.exports = (msg) => {
  fs.appendFileSync( './logfile', `${msg}\n` );
  debug( msg );
}
