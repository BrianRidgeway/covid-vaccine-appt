const fs = require( 'fs' );
const log = require( './log' );
const {exec} = require( 'child_process' );
const pidFile = './vaccine.pid';
exports.createPid = () => {
  if( fs.existsSync( pidFile ) ){
    let oldPid = fs.readFileSync( pidFile );
    log( `Found running process ${oldPid}, killing...` );
    exec( `kill -SIGTERM -- -${oldPid}`, { shell: '/bin/bash' }, (error, stdout, stderr) => {
      if( error ){
        log( error );
      }
      else{
        log( `kille pgid ${oldPid}` );
      }
    });
  }
  fs.writeFileSync( pidFile, process.pid );
}

exports.deletePid = () => {
  let pidFilePid = fs.readFileSync(pidFile);
  if( pidFilePid == process.pid ){
    fs.unlinkSync( pidFile );
  }
}
