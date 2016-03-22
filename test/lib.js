import test from 'ava';
import path from 'path';

const
  processCwd = process.cwd,
  workingDir = process.cwd(),
  mockedWorkingDirForOptFiles = path.resolve( workingDir, './fixtures/opt-files' ),
  mockedWorkingDirForPackageJson = path.resolve( workingDir, './fixtures/package' );

test.beforeEach( () => {
  process.cwd = () => workingDir;
} );

test.afterEach( () => {
  process.cwd = processCwd;
} );

test( 'check explicit opt-ins & opt-outs (.opt-in and .opt-out existing)', t => {
  process.cwd = () => mockedWorkingDirForOptFiles;

  const
    { getExplicitOpts } = require( '../lib/index' ),
    expectedOpts = {
      'opted-in-foo-rule': true,
      'opted-in-bar-rule': true,
      'opted-out-foo-rule': false,
      'opted-out-bar-rule': false
    },
    retrievedOpts = getExplicitOpts();

  t.same( retrievedOpts, expectedOpts, 'retrieved opts should equal expected opts' );
} );

test( 'check explicit opt-ins & opt-outs (via package.json)', t => {
  process.cwd = () => mockedWorkingDirForPackageJson;

  const
    { getExplicitOpts } = require( '../lib/index' ),
    expectedOpts = {
      'package-json-opted-in-foo-rule': true,
      'package-json-opted-in-bar-rule': true,
      'package-json-opted-out-foo-rule': false,
      'package-json-opted-out-bar-rule': false
    },
    retrievedOpts = getExplicitOpts();

  t.same( retrievedOpts, expectedOpts, 'retrieved opts should equal expected opts' );
} );

test( 'test for particular opt-ins (.opt-in existing)', t => {
  process.cwd = () => mockedWorkingDirForOptFiles;

  const
    { testOptIn } = require( '../lib/index' );

  t.true(
    testOptIn( [ 'opted-in-foo-rule', 'opted-in-bar-rule' ] ),
    'opted-in-foo-rule & opted-in-bar-rule should be true'
  );

  t.false(
    testOptIn( 'opted-in-bazbaz' ),
    'opted-in-bazbaz should be false'
  );
} );

test( 'test for particular opt-ins (via package.json)', t => {
  process.cwd = () => mockedWorkingDirForPackageJson;

  const
    { testOptIn } = require( '../lib/index' );

  t.true(
    testOptIn( [ 'package-json-opted-in-foo-rule', 'package-json-opted-in-bar-rule' ] ),
    'package-json-opted-in-foo-rule & package-json-opted-in-bar-rule should be true'
  );

  t.false(
    testOptIn( 'package-json-opted-in-bazbaz' ),
    'package-json-opted-in-bazbaz should be false'
  );
} );

test( 'test for particular opt-ins (no config existing)', t => {
  const
    { testOptIn } = require( '../lib/index' );

  t.false(
    testOptIn( [ 'opted-in-foo-rule', 'opted-in-bar-rule' ] ),
    'opted-in-foo-rule & opted-in-bar-rule should be false'
  );
} );

test( 'test for particular opt-outs (.opt-out existing)', t => {
  process.cwd = () => mockedWorkingDirForOptFiles;

  const
    { testOptOut } = require( '../lib/index' );

  t.true(
    testOptOut( [ 'opted-out-foo-rule', 'opted-out-bar-rule' ] ),
    'opted-out-foo-rule & opted-out-bar-rule should be true'
  );

  t.false(
    testOptOut( 'opted-out-bazbaz' ),
    'opted-out-bazbaz should be false'
  );
} );

test( 'test for particular opt-outs (package.json existing)', t => {
  process.cwd = () => mockedWorkingDirForPackageJson;

  const
    { testOptOut } = require( '../lib/index' );

  t.true(
    testOptOut( [ 'package-json-opted-out-foo-rule', 'package-json-opted-out-bar-rule' ] ),
    'package-json-opted-out-foo-rule & package-json-opted-out-bar-rule should be true'
  );

  t.false(
    testOptOut( 'package-json-opted-out-bazbaz' ),
    'package-json-opted-out-bazbaz should be false'
  );
} );

test( 'test for particular opt-outs (no config existing)', t => {
  const
    { testOptOut } = require( '../lib/index' );

  t.false(
    testOptOut( [ 'opted-out-foo-rule', 'opted-out-bar-rule' ] ),
    'opted-out-foo-rule & opted-out-bar-rule should be false'
  );
} );
