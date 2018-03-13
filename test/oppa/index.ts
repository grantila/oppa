
import 'mocha'
import { expect } from 'chai'

import { oppa } from '../../'


function mockConsoleLog( )
{
	const oldLog = console.log;

	const lines = [ ];
	console.log = ( ...args ) => lines.push( args.join( ' ' ) );

	return {
		lines,
		cleanup: ( ) => console.log = oldLog,
	};
}

describe( 'basics', ( ) =>
{
	it( 'should work handle empty list of arguments', ( ) =>
	{
		const result = oppa( ).parse( [ ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle rest on empty arguments', ( ) =>
	{
		const result = oppa( ).parse( [ 'foo' ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ 'foo' ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should throw on already existing (long) name', ( ) =>
	{
		const parser = ( ) =>
			oppa( )
			.add( { name: 'foo', type: 'string' } )
			.add( { name: 'bar', type: 'string' } )
			.add( { name: 'foo', type: 'string' } );

		expect( parser ).to.throw( /'foo'.*already added/ );
	} );

	it( 'should throw on conflicting auto-negated long name', ( ) =>
	{
		const parser = ( ) =>
			oppa( )
			.add( { name: 'foo', type: 'boolean' } )
			.add( { name: 'bar', type: 'boolean' } )
			.add( { name: 'no-foo', type: 'boolean' } );

		expect( parser ).to.throw( /fo.*already added/ );
	} );

	it( 'should throw on already existing (short) name', ( ) =>
	{
		const parser = ( ) =>
			oppa( )
			.add( { name: 'foo', type: 'string', alias: 'f' } )
			.add( { name: 'bar', type: 'string', alias: 'b' } )
			.add( { name: 'baz', type: 'string', alias: 'b' } );

		expect( parser ).to.throw( /'b'.*already added/ );
	} );
} );

describe( 'boolean', ( ) =>
{	
	it( 'should handle single unused boolean argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single unused boolean argument (default=false)', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
				default: false,
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { add: false } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single unused boolean argument (default=true)', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
				default: true,
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { add: true } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single used boolean argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
			} )
			.parse( [ '-a' ] );

		expect( result.args ).to.deep.equal( { add: true } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single negated boolean argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
			} )
			.parse( [ '--no-add' ] );

		expect( result.args ).to.deep.equal( { add: false } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single used boolean argument (overriding default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
				default: false
			} )
			.parse( [ '-a' ] );

		expect( result.args ).to.deep.equal( { add: true } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single negated boolean argument (overriding default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
				default: true
			} )
			.parse( [ '--no-add' ] );

		expect( result.args ).to.deep.equal( { add: false } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'shouldn\'t allow value ("=value") for booleans', ( ) =>
	{
		const parser = ( ) =>
			oppa( { throwOnError: true } )
			.add( {
				name: 'add',
				type: 'boolean',
			} )
			.parse( [ '--add=1' ] );

		expect( parser ).to.throw( 'usage' );
	} );

	it( 'shouldn\'t allow value ("=value") for last shortened boolean', ( ) =>
	{
		const parser = ( ) =>
			oppa( { throwOnError: true, allowUnknown: true } )
			.add( {
				name: 'add',
				type: 'boolean',
				alias: 'a',
			} )
			.parse( [ '-xa=1' ] );

		expect( parser ).to.throw( 'usage' );
	} );
} );

describe( 'string', ( ) =>
{	
	it( 'should handle single unused string argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single unused string argument (empty default)', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
				default: '',
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { foo: '' } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single unused string argument (non-empty default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
				default: 'bar',
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { foo: 'bar' } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single used string argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
			} )
			.parse( [ '-f', 'bar' ] );

		expect( result.args ).to.deep.equal( { foo: 'bar' } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single empty string argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
			} )
			.parse( [ '-f', '' ] );

		expect( result.args ).to.deep.equal( { foo: '' } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single used string argument (overriding default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
				default: ''
			} )
			.parse( [ '-f', 'bar' ] );

		expect( result.args ).to.deep.equal( { foo: 'bar' } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single negated string argument (overriding default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'string',
				alias: 'f',
				default: 'bar'
			} )
			.parse( [ '-f', '' ] );

		expect( result.args ).to.deep.equal( { foo: '' } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'number', ( ) =>
{	
	it( 'should handle single unused number argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single unused number argument (default=0)', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				default: 0,
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { foo: 0 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single unused number argument (default=1)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				default: 1,
			} )
			.parse( [ ] );

		expect( result.args ).to.deep.equal( { foo: 1 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single non-zero number argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', '1' ] );

		expect( result.args ).to.deep.equal( { foo: 1 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single zero number argument', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', '0' ] );

		expect( result.args ).to.deep.equal( { foo: 0 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should fail on single empty string argument', ( ) =>
	{
		const parse = ( ) => oppa( { throwOnError: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', '' ] );

		expect( parse ).to.throw( );
	} );

	it( 'should fail on single non-numeric argument', ( ) =>
	{
		const parse = ( ) => oppa( { throwOnError: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', 'x' ] );

		expect( parse ).to.throw( "Invalid numeric" );
	} );

	it( 'should handle single used number argument (overriding default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				default: 0,
			} )
			.parse( [ '-f', '1' ] );

		expect( result.args ).to.deep.equal( { foo: 1 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle single negated number argument (overriding default)',
		( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				default: 1,
			} )
			.parse( [ '-f', '0' ] );

		expect( result.args ).to.deep.equal( { foo: 0 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'help', ( ) =>
{
	it( 'should print help screen on <showHelp>', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( ).showHelp( );

		cleanup( );

		const helpLine = lines.filter( line => /-h, --help/.test( line ) );

		expect( helpLine.length ).to.equal( 1 );
		expect( helpLine[ 0 ] ).to.contain( "help" );
	} );

	it( 'should not print --version unless version is provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( ).showHelp( );

		cleanup( );

		const verLine = lines.filter( line => /-v, --version/.test( line ) );

		expect( verLine.length ).to.equal( 0 );
	} );

	it( 'should print --version if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { version: '0.0.1' } ).showHelp( );

		cleanup( );

		const verLine = lines.filter( line => /-v, --version/.test( line ) );

		expect( verLine.length ).to.equal( 1 );
		expect( verLine[ 0 ] ).to.contain( "version" );
	} );

	it( 'should print --version if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { noExit: true, version: '0.0.1' } ).parse( [ '-v' ] );

		cleanup( );

		expect( lines ).to.deep.equal( [ '0.0.1' ] );
	} );

	it( 'should print --help if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { noExit: true } ).parse( [ '-h' ] );

		cleanup( );

		expect( lines.filter( line => /Usage:/.test( line ) ).length )
			.to.equal( 1 );
	} );
} );

describe( 'version', ( ) =>
{
	it( 'should print version on -v', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { version: '1.2.3', noExit: true } ).parse( [ '-v' ] );

		cleanup( );

		expect( lines ).to.deep.equal( [ '1.2.3' ] );
	} );

	it( 'should print version and program name on -v', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { version: '1.2.3', name: 'foo', noExit: true } )
			.parse( [ '-v' ] );

		cleanup( );

		expect( lines ).to.deep.equal( [ 'foo 1.2.3' ] );
	} );
} );

describe( 'unknown', ( ) =>
{
	it( 'should not allow unknown arguments', ( ) =>
	{
		const parser = ( ) => oppa( { throwOnError: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', '0', '-g' ] );

		expect( parser ).to.throw( 'Unknown' );
	} );

	it( 'should allow simple unknown arguments', ( ) =>
	{
		const result = oppa( { allowUnknown: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', '0', '-g' ] );

		expect( result.args ).to.deep.equal( { foo: 0 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [
			{ name: 'g', value: undefined }
		] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should allow valued unknown arguments', ( ) =>
	{
		const result = oppa( { allowUnknown: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', '0', '-g=x' ] );

		expect( result.args ).to.deep.equal( { foo: 0 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [
			{ name: 'g', value: 'x' }
		] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'negatable', ( ) =>
{
	it( 'should use <negatable> by default', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'boolean',
			} )
			.parse( [ '--no-foo' ] );

		expect( result.args ).to.deep.equal( { foo: false } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should use <negatable> if explicitly true', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'boolean',
				negatable: true,
			} )
			.parse( [ '--no-foo' ] );

		expect( result.args ).to.deep.equal( { foo: false } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'shouldn\'t use <negatable> if explicitly false', ( ) =>
	{
		const result = oppa( { allowUnknown: true } )
			.add( {
				name: 'foo',
				type: 'boolean',
				negatable: false,
			} )
			.parse( [ '--no-foo' ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown )
			.to.deep.equal( [ { name: 'no-foo', value: undefined } ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'realDefault', ( ) =>
{
	it( 'should specify default in --help but use realDefault', ( ) =>
	{
		const parser = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				default: 1,
				realDefault: 2,
			} );

		const { lines, cleanup } = mockConsoleLog( );
		parser.showHelp( false );
		cleanup( );

		const result = parser.parse( [ ] );

		const fooLine = lines.filter( line => /foo/.test( line ) )[ 0 ];

		expect( fooLine ).to.contain( "default: 1" );
		expect( result.args ).to.deep.equal( { foo: 2 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'match', ( ) =>
{
	it( 'should handle functions (mismatch)', ( ) =>
	{
		const parser = ( ) =>
			oppa( { throwOnError: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				match: num => num % 2 === 0,
			} )
			.parse( [ '-f', '1' ] );

		expect( parser ).to.throw( 'Invalid argument' );
	} );

	it( 'should handle functions (match)', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				match: num => num % 2 === 0,
			} )
			.parse( [ '-f', '2' ] );

		expect( result.args ).to.deep.equal( { foo: 2 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle regular expressions (mismatch)', ( ) =>
	{
		const parser = ( ) =>
			oppa( { throwOnError: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				match: /[02468]/,
			} )
			.parse( [ '-f', '1' ] );

		expect( parser ).to.throw( 'Invalid argument' );
	} );

	it( 'should handle regular expressions (match)', ( ) =>
	{
		const result = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				match: /[02468]/,
			} )
			.parse( [ '-f', '2' ] );

		expect( result.args ).to.deep.equal( { foo: 2 } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'help table', ( ) =>
{
	it( 'should properly print value table (if just object)', ( ) =>
	{
		const parser = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				values: {
					'a': 'A',
					'b': 'B',
				}
			} );

		const { lines, cleanup } = mockConsoleLog( );
		parser.showHelp( false );
		cleanup( );

		const numA = lines.filter( line => /a.*A/.test( line ) ).length;
		const numB = lines.filter( line => /b.*B/.test( line ) ).length;

		expect( numA ).to.equal( 1 );
		expect( numB ).to.equal( 1 );
	} );

	it( 'should properly print value table (if array of objects)', ( ) =>
	{
		const parser = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				values: [
					{
						'a': 'A',
						'b': 'B',
					},
					{
						'c': 'C',
					}
				]
			} );

		const { lines, cleanup } = mockConsoleLog( );
		parser.showHelp( false );
		cleanup( );

		const numA = lines.filter( line => /a.*A/.test( line ) ).length;
		const numB = lines.filter( line => /b.*B/.test( line ) ).length;
		const numC = lines.filter( line => /c.*C/.test( line ) ).length;

		expect( numA ).to.equal( 1 );
		expect( numB ).to.equal( 1 );
		expect( numC ).to.equal( 1 );
	} );

	it( 'should properly print example table (if just object)', ( ) =>
	{
		const parser = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				example: {
					'a': 'A',
					'b': 'B',
				}
			} );

		const { lines, cleanup } = mockConsoleLog( );
		parser.showHelp( false );
		cleanup( );

		const numA = lines.filter( line => /a.*A/.test( line ) ).length;
		const numB = lines.filter( line => /b.*B/.test( line ) ).length;

		expect( numA ).to.equal( 1 );
		expect( numB ).to.equal( 1 );
	} );

	it( 'should properly print example table (if array of objects)', ( ) =>
	{
		const parser = oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
				example: [
					{
						'a': 'A',
						'b': 'B',
					},
					{
						'c': 'C',
					}
				]
			} );

		const { lines, cleanup } = mockConsoleLog( );
		parser.showHelp( false );
		cleanup( );

		const numA = lines.filter( line => /a.*A/.test( line ) ).length;
		const numB = lines.filter( line => /b.*B/.test( line ) ).length;
		const numC = lines.filter( line => /c.*C/.test( line ) ).length;

		expect( numA ).to.equal( 1 );
		expect( numB ).to.equal( 1 );
		expect( numC ).to.equal( 1 );
	} );
} );

// TODO: Test multi
//       Test description
//       Test values
//       Test examples
//       Test match
