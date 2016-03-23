import test from 'ava';

const
  proxyquire = require( 'proxyquire' ).noPreserveCache(),
  processCwd = process.cwd,
  workingDir = process.cwd();


test.beforeEach( () => {
  process.argv.splice( 2, process.argv.length );
  process.cwd = () => workingDir;
} );

test.afterEach( () => {
  process.cwd = processCwd;
} );


test( 'test execution with insufficient arguments', ( t ) => {
  proxyquire( '../bin/index', {
    cli: {
      getUsage: function mockedCliGetUsage() {
        t.pass();
      },
      // prevent proxyquire from caching!
      '@global': true
    }
  } );
} );

test( 'test execution on not specified opt-in rule', ( t ) => {
  t.plan( 1 );

  process.argv = process.argv.concat( [
    '--in',
    'unset-opt-in-rule',
    '--exec',
    'echo "opt-cli bin test output #1"',
    '--verbose'
  ] );

  proxyquire( '../bin/index', {
    cli: {
      info: function mockedCliInfo( message ) {
        t.same( message, 'Not opted-in to "unset-opt-in-rule".' );
      },
      // prevent proxyquire from caching!
      '@global': true
    }
  } );
} );

test( 'test execution on not specified opt-out rule', ( t ) => {
  t.plan( 2 );

  process.argv = process.argv.concat( [
    '--out',
    'unset-opt-out-rule',
    '--exec',
    'echo "opt-cli bin test output #2"'
  ] );

  proxyquire( '../bin/index', {
    'spawn-command': function mockedSpawn( command ) {
      t.same( command, 'echo "opt-cli bin test output #2"' );

      return {
        on: ( what ) => {
          t.same( what, 'exit' );
        }
      };
    }
  } );
} );

test( 'test execution on a specified opt-in rule', ( t ) => {
  t.plan( 1 );

  process.argv = process.argv.concat( [
    '--out',
    'set-opt-out-rule',
    '--exec',
    'echo "opt-cli bin test output #2"',
    '--verbose'
  ] );

  proxyquire( '../bin/index', {
    '../lib/index': {
      testOptOut: function mockedLibTestOptOut( opt ) {
        return opt === 'set-opt-out-rule';
      }
    },
    cli: {
      info: function mockedCliInfo( message ) {
        t.same( message, 'Opted-out of "set-opt-out-rule".' );
      },
      // prevent proxyquire from caching!
      '@global': true
    }
  } );
} );
