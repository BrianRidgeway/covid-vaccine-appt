const fs = require( 'fs' );
const log = require( './log' );

const pidFile = './vaccine.pid';
exports.createPid = () => {
  if( fs.existsSync( pidFile ) ){
    let oldPid = fs.readFileSync( pidFile );
    log( `Found running process ${oldPid}, killing...` );
    process.kill( `-${oldPid}`, 'SIGTERM' );
    log( `killed\n` );
  }
  fs.writeFileSync( pidFile, process.pid );
}

exports.deletePid = () => {
  fs.unlinkSync( pidFile );
}
