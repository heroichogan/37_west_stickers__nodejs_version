// This script runs as a Google Sheets script
// Example of correct form for data in Sheet:
// apple	butter	$5.00


// When the sheet changes or is edited, post the new data
function postSheetData( e ) {

  // Get current spreadsheet data
  var ss = SpreadsheetApp.getActiveSpreadsheet() ;
  var sheet = ss.getSheets()[0];
  var range = sheet.getDataRange();
  var data = range.getValues() ;   
  var sData = data + '' ;

  // Debug
  Logger.log( sData ) ;  

  // Post the data
  sendHttpPost(sData) ; 
}


// Sends POST payload data in the style of an HTML form, including
// a file. Example based on the Google docs.
function sendHttpPost(sData) {

  // Put the data in an object
  var payload =
  {
    "data" : sData,
  };

  // Set the form options
  // (Because payload is a JavaScript object, it will be interpreted as
  // an HTML form. (We do not need to specify contentType; it will
  // automatically default to either 'application/x-www-form-urlencoded'
  // or 'multipart/form-data')). 

  var options =
  {
    "method" : "post",
    "payload" : payload
  };


  // Do the post
  UrlFetchApp.fetch("http://port-3000-yaygd0akwz.treehouse-app.com/upload", options);
}
