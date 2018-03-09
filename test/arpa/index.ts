
import 'mocha'
import { expect } from 'chai'

import { arpa } from '../../'

describe( 'basics', ( ) =>
{
	it( 'should work handle empty list of arguments', ( ) =>
	{
		const result = arpa( ).parse( [ ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );

	it( 'should handle rest on empty arguments', ( ) =>
	{
		const result = arpa( ).parse( [ 'foo' ] );

		expect( result.args ).to.deep.equal( { } );
		expect( result.rest ).to.deep.equal( [ 'foo' ] );
		expect( result.unknown ).to.deep.equal( [ ] );
		expect( result.dashdash ).to.deep.equal( [ ] );
	} );
} );

describe( 'boolean', ( ) =>
{	
	it( 'should handle single unused boolean argument', ( ) =>
	{
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
} );

describe( 'string', ( ) =>
{	
	it( 'should handle single unused string argument', ( ) =>
	{
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const result = arpa( )
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
		const parse = ( ) => arpa( { throwOnError: true } )
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
		const parse = ( ) => arpa( { throwOnError: true } )
			.add( {
				name: 'foo',
				type: 'number',
				alias: 'f',
			} )
			.parse( [ '-f', 'x' ] );

		expect( parse ).to.throw( );
	} );

	it( 'should handle single used number argument (overriding default)',
		( ) =>
	{
		const result = arpa( )
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
		const result = arpa( )
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
		const oldLog = console.log;

		const lines = [ ];
		console.log = ( ...args ) => lines.push( args.join( ' ' ) );

		arpa( ).showHelp( );

		console.log = oldLog;

		const helpLine = lines.filter( line => /-h, --help/.test( line ) );

		expect( helpLine.length ).to.equal( 1 );
		expect( helpLine[ 0 ] ).to.contain( "help" );
	} );

	it( 'should not print --version unless version is provided', ( ) =>
	{
		const oldLog = console.log;

		const lines = [ ];
		console.log = ( ...args ) => lines.push( args.join( ' ' ) );

		arpa( ).showHelp( );

		console.log = oldLog;

		const verLine = lines.filter( line => /-v, --version/.test( line ) );

		expect( verLine.length ).to.equal( 0 );
	} );

	it( 'should print --version if provided', ( ) =>
	{
		const oldLog = console.log;

		const lines = [ ];
		console.log = ( ...args ) => lines.push( args.join( ' ' ) );

		arpa( { version: '0.0.1' } ).showHelp( );

		console.log = oldLog;

		const verLine = lines.filter( line => /-v, --version/.test( line ) );

		expect( verLine.length ).to.equal( 1 );
		expect( verLine[ 0 ] ).to.contain( "version" );
	} );
} );

describe( 'version', ( ) =>
{
	it( 'should print version on -v', ( ) =>
	{
		const oldLog = console.log;

		const lines = [ ];
		console.log = ( ...args ) => lines.push( args.join( ' ' ) );

		arpa( { version: '1.2.3', noExit: true } ).parse( [ '-v' ] );

		console.log = oldLog;

		expect( lines ).to.deep.equal( [ '1.2.3' ] );
	} );

	it( 'should print version and program name on -v', ( ) =>
	{
		const oldLog = console.log;

		const lines = [ ];
		console.log = ( ...args ) => lines.push( args.join( ' ' ) );

		arpa( { version: '1.2.3', name: 'foo', noExit: true } )
			.parse( [ '-v' ] );

		console.log = oldLog;

		expect( lines ).to.deep.equal( [ 'foo 1.2.3' ] );
	} );
} );

describe( 'unknown', ( ) =>
{
	it( 'should not allow unknown arguments', ( ) =>
	{
		const parser = ( ) => arpa( { throwOnError: true } )
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
		const result = arpa( { allowUnknown: true } )
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
		const result = arpa( { allowUnknown: true } )
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

// TODO: Test multi
//       Test description
//       Test values
//       Test examples
//       Test match
//       Test negatable
//       Test realDefault
