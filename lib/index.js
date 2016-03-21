var
  fs = require( 'fs' ),
  path = require( 'path' );


function fileExists( filePath ) {
  var
    fileStat;

  try {
    fileStat = fs.statSync( filePath );
  } catch ( e ) {
    return false;
  }

  return fileStat && fileStat.isFile();
}

function transformFileContents( file ) {
  var
    filePath = path.resolve( process.cwd(), file );

  if ( !fileExists( filePath ) ) {
    return [];
  }

  return ( fs.readFileSync( filePath, 'utf8' ) )
    .split( '\n' )
    .filter( line => line !== '' );
}

function getPackageConfig() {
  var
    jsonPath = path.resolve( process.cwd(), 'package.json' ),
    json,
    config = {};

  if ( fileExists( jsonPath ) && ( json = require( jsonPath ) ) && json.hasOwnProperty( 'config' ) && json.config.hasOwnProperty( 'opt' ) ) {
    /* istanbul ignore else */
    if ( json.config.opt.hasOwnProperty( 'in' ) && Array.isArray( json.config.opt.in ) ) {
      config.in = json.config.opt.in;
    }

    /* istanbul ignore else */
    if ( json.config.opt.hasOwnProperty( 'out' ) && Array.isArray( json.config.opt.out ) ) {
      config.out = json.config.opt.out;
    }
  }

  return config;
}

function getOptIns() {
  var
    config = getPackageConfig();

  return config.in || transformFileContents( '.opt-in' );
}

function getOptOuts() {
  var
    config = getPackageConfig();

  return config.out || transformFileContents( '.opt-out' );
}

function includesAll( needles, haystack ) {
  var
    needle,
    _needles = [].concat( needles ),
    len = _needles.length;

  if ( !needles || !len || !haystack.length ) {
    return false;
  }

  while ( len-- ) {
    needle = _needles[ len ];
    if ( haystack.indexOf( needle ) === -1 ) {
      return false;
    }
  }

  return true;
}


function getExplicitOpts() {
  var
    allOpts = {};

  getOptIns().forEach(
    function iterateOptIns( opt ) {
      allOpts[ opt ] = true;
    }
  );

  getOptOuts().forEach(
    function iterateOptOuts( opt ) {
      allOpts[ opt ] = false;
    }
  );

  return allOpts;
}

function testOptIn( opts ) {
  return includesAll( opts, getOptIns() );
}

function testOptOut( opts ) {
  return includesAll( opts, getOptOuts() );
}


module.exports = {
  getExplicitOpts: getExplicitOpts,
  testOptIn: testOptIn,
  testOptOut: testOptOut
};
