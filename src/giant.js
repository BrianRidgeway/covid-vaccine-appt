module.exports = async( page, config ) => {
  let giantStatus = await page.$eval( '#divApptTypeInfo0', n => n.innerText)
  if( giantStatus.match( /There are currently no COVID-19 vaccine appointments available/) ){
    return "";
  }
  else{
    return giantStatus;
  }
}

