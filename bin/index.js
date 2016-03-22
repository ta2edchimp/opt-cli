#!/usr/bin/env node

'use strict';

var
  cli = require( 'cli' ),
  spawn = require( 'spawn-command' ),
  opt = require( '../lib/index' );

cli.parse( {
  in: [ 'i', 'Rule to be opted-in to', 'string' ],
  out: [ 'o', 'Rule to be outed-out to', 'string' ],
  exec: [ 'e', 'Command to execute when opted-in or not opted-out of the given rule', 'string' ],
  verbose: [ false, 'Output additional details', 'bool' ]
} );

cli.main( function cliMain( args, options ) {
  var info = function emptyFn() {};

  // invalid arguments: "in" OR "out" have to be specified, as well es "exec"
  if ( ( options.in && options.out ) || ( !options.in && !options.out ) || !options.exec ) {
    cli.getUsage();
    return;
  }

  if ( options.verbose ) {
    info = cli.info;
  }

  if ( options.in && !opt.testOptIn( options.in ) ) {
    info( 'Not opted-in to "' + options.in + '".' );
    return;
  }

  if ( options.out && opt.testOptOut( options.out ) ) {
    info( 'Opted-out of "' + options.out + '".' );
    return;
  }

  info( 'Execute all the things: ' + options.exec );
  spawn( options.exec, { stdio: 'inherit', env: process.env } )
    .on( 'exit', process.exit );
} );
