const assert = require('assert') ; 
const fs = require('fs') ; 
const url = require('url') ;
const querystring = require('querystring') ; 
const get = require('get'); 
const PATH_TO_DATA = 'https://docs.google.com/spreadsheets/d/1eYxf0_FKRXB4MLgPt3cqoaxZMBc--WQk2VxQ7NkG2sw/pub?gid=0&single=true&output=csv' ;



function serveTextFile( filename, response ) { 
  // Get file contents 
  var contents = fs.readFileSync( filename, 'utf8' ) ; 
  
  // Send file contents 
  response.write( contents );  
} 


function populateStickerTemplate( line1, line2, price ) { 
  // Get the template
  var template = fs.readFileSync( 'stickers.svg', 'utf8' ) ;

  // Return
  return template ;
}


function renderStickers( request, response, data ) { 
  // !. Get the query string
  var args = querystring.parse( url.parse(request.url)['query']  ) ; 
  
  // 2. Grab row for current product
  var dd = data[args.row] ; 
  var merged = populateStickerTemplate( dd[0], dd[1], dd[2] ) ; 
  
  // 3. Render the page and respond
  response.write( merged ) ; 
}


function nicenData( sData ) {
  // ?? Remove extra formatting (present only
  // ?? when we pull (GET) the data from the static 
  // ?? published page). 

  sData = sData.replace( /[$"]/gm, '' ) ; 
  
  // Build nicely structured array
  var data = sData.split(/,|\r\n/) ;
  
  var nice = [] ; 
  for( var i=0; i  < data.length; i += 3 ) {
    nice.push( [ data[i], data[i+1], '$' + parseFloat(data[i+2]).toFixed(2) ] ) ; 
  }
  
  // Return nice array
  return nice ; 
}


function renderIndex( response  ) { 
  // Get the template
  var template = fs.readFileSync( 'app.html', 'utf8' ) ;   
  
  // Assemble whole document
  response.write( template ); 
}



function pullData( request, response, callback ) {
  get(PATH_TO_DATA).asString(function(err, sData) {
      if (err) throw err;
      callback( sData ) ; 
  });
}
  

module.exports.renderIndex = renderIndex ; 
module.exports.renderStickers = renderStickers ; 
module.exports.pullData = pullData ; 
module.exports.nicenData = nicenData ; 
module.exports.serveTextFile = serveTextFile ; 