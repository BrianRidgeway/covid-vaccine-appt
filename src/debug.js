module.exports = (msg) => {
  if( process.env.DEBUG ){
    console.debug( msg );
  }
}
