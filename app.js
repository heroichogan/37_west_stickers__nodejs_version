const http = require('http');
const querystring = require('querystring') ; 
const fs = require('fs'); 
const assert = require('assert') ; 
const colors = require('colors') ; 
const stickers = require('./stickers.js') ; 
const PORT = 3000;
 

function setData( data ) {
  if (data['data']) {
    data = data['data']; 
  } 
    
  data = stickers.nicenData( data ) ;
  data = JSON.stringify( data ) ;   
  fs.writeFileSync( 'saved_data', data ) ;
}


function getData() {
  try {
    data = fs.readFileSync( 'saved_data', 'utf8' ) ; 
    data = JSON.parse( data ) ;
    return data ; 
    
  } catch( err ) {
    console.error( `Problem in getData(); ${err}` ) ; 
    return null ; 
  }
}


// Fire SSE 
function fireSSE( response ) {
  response.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }); 
  
  var d = JSON.stringify( getData() ) ; 
  
  response.write( `data: ${d}\n\n` ) ;
  response.end() ; 
}

  

// Create server
const server = http.createServer((request, response) => {
  console.log( request.url ) ; 
  
  if( request.url === '/app.js' ) { 
    fireSSE( response ) ; 
  
  } else if(request.url === '/' ) { 
  
    // A. Index path
    //    If saved_data does not already exist, GET it 
    //    from Google (it's published to a static URL). 
    //    Either way, render index page and end
    //    the response. 

    data = getData() ; 
    if( data ) {
      // Data is already saved here on our server, so
      // render the page then end response.
      response.writeHead(200, {'Content-Type': 'text/html', 'Cache-Control': 'no-cache'} );
      stickers.renderIndex( response ) ; 
      response.end();     
    } else {
      // We need to get data directly from the published file.
      // This is only necessary the first time. After that, 
      // changes get POSTed via '/upload' path. 
      stickers.pullData( request, response, function(newData) {
        // Record the new data
        setData( newData ) ;  
        
        // Tell the page to update
        fireSSE( response ) ;
      }) ; 
    }

  } else if(request.url.startsWith('/upload')) {
    // B. Upload path. 
    //    The Google Sheets AppsScript is pushing updated data,
    //    so save it and notify the client.
    assert( request.method=='POST', "GET not supported by '/upload'" ) ; 
    if(request.method=='POST') {
      var body='';
      request.on('data', function (data) {
        body +=data;
      });
      request.on('end', function() {
        // Parse and record the new data
        var s = querystring.parse(body) ; // form: 'maple bourbon,pecan tacos,44,a good,boy,24,silly,fruit,9.99,blackberry,donuts,22...'  
        setData( s ) ;
        
        // Fire SSE
        fireSSE( response ) ;
       });    
    } 
    
  } else if(request.url.startsWith('/stickers') ) {  
    // C. Stickers path
    response.writeHead(200, {'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-cache' });  
    stickers.renderStickers( request, response, getData() ) ; 
    response.end() ; 
    
  } else if( request.url.endsWith('.css') ) {
    response.writeHead(200, {'Content-Type': 'text/css', 'Cache-Control': 'no-cache' }); // [2] 
    stickers.serveTextFile( 'styles.css', response ) ; // [2] 
    response.end() ; // [2] 
    
  } else {
    // D. Other paths (ignore)
    //... 
  }
});


// Start server
server.listen(PORT, () => {
  console.log(`Server running at ${PORT}/`);
});

  
  
  
