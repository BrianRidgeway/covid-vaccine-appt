const fs = require( 'fs' );
const log = require( './log' );

const pidFile = './vaccine.pid';
exports.createPid = () => {
  if( fs.existsSync( pidFile ) ){
    let oldPid = fs.readFileSync( pidFile );
    log( `Found running process ${oldPid}, killing...` );
    try {
      process.kill( -oldPid, 'SIGTERM' );
      log( `killed\n` );
    } catch( e ){
      if( e.name = "kill ESRCH" ){
       log( `Process not found` );
      }
    };
  }
  fs.writeFileSync( pidFile, process.pid );
}

exports.deletePid = () => {
  fs.unlinkSync( pidFile );
}
