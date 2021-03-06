#!/usr/bin/env node

'use strict';

var
  program = require( 'commander' ),
  path = require( 'path' ),
  managePath = require( 'manage-path' ),
  spawn = require( 'spawn-command' ),
  opt = require( '../lib/index' ),
  pkg = require( '../package.json' );

program
  .version( pkg.version )
  .description( 'Execute CLI Statements based upon Opt-In / Opt-Out Rules.' )
  .option( '-i, --in [rule]', 'Rule to be opted-in to' )
  .option( '-o, --out [rule]', 'Rule to be outed-out of' )
  .option( '-e, --exec <command>', 'Command to execute when opted-in to or not opted-out of the given rule' )
  .option( '-l, --list', 'List explicitly set opt-in and opt-out rules' )
  .option( '--verbose', 'Output additional details' );

program.on( '--help', function customHelp() {
  console.log( // eslint-disable-line no-console
    '  Please specify\n\n' +
    '    - either a rule to be opted-in to or out of\n' +
    '    - a command to execute\n\n' +
    '  See https://www.npmjs.com/package/opt-cli for detailed usage instructions\n'
  );
} );

program.parse( process.argv );

cliMain();

function cliMain() {
  var
    info = function emptyFn() { }, // eslint-disable-line func-style, no-empty-function
    cwd = process.cwd(),
    // eslint-disable-next-line id-match
    env = Object.keys( process.env )
      // eslint-disable-next-line no-undefined
      .filter( ( key ) => process.env[ key ] !== undefined )
      .reduce(
        ( accumulator, key ) => {
          accumulator[ key ] = process.env[ key ];

          return accumulator;
        },
        {}
      ),
    alteredEnvPath = null;

  // invalid arguments: ("in" OR "out" have to be specified, as well es "exec") OR "list" has to be requested
  if (
    ( ( program.in && program.out ) || ( !program.in && !program.out ) || !program.exec ) &&
    !program.list
  ) {
    program.help();

    return;
  }

  if ( program.verbose ) {
    info = console.log; // eslint-disable-line no-console
  }

  if ( program.in && !opt.testOptIn( program.in ) ) {
    info( 'Not opted-in to "' + program.in + '".' );

    return;
  }

  if ( program.out && opt.testOptOut( program.out ) ) {
    info( 'Opted-out of "' + program.out + '".' );

    return;
  }

  if ( program.list ) {
    listExplicitOpts();

    return;
  }

  // prepare PATH env var to include cwd/node_modules/bin
  alteredEnvPath = managePath( env );
  alteredEnvPath.unshift( path.resolve( cwd, 'node_modules', '.bin' ) );

  info( 'Execute all the things: ' + program.exec );
  spawn( program.exec, { stdio: 'inherit', env: env } )
    .on( 'exit', process.exit );
}

function listExplicitOpts() {
  var explictOpts = opt.getExplicitOpts(),
    flags = Object.keys( explictOpts ), // eslint-disable-line id-match
    sorted = { in: [], out: [] },
    output = [];

  // Filter results to print in-out
  sorted = flags.reduce(
    function sortExplicit( accumulator, key ) {
      accumulator[ explictOpts[ key ] ? 'in' : 'out' ].push( key );

      return accumulator;
    },
    sorted
  );

  if ( sorted.in.length ) {
    output.push( 'Opted-in to:\n' + ' - ' + sorted.in.join( '\n - ' ) );
  }

  if ( sorted.out.length ) {
    output.push( 'Opted-out of:\n' + ' - ' + sorted.out.join( '\n - ' ) );
  }

  if ( !flags.length ) {
    output.push( 'No explict opt-in or opt-out configuration found.' );
  }

  // eslint-disable-next-line no-console
  console.log( output.join( '\n\n' ) );
}
