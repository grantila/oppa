import { oppa, TypeOf } from './oppa'


function mockConsoleLog( )
{
	const oldLog = console.log;

	const lines = [ ];
	console.log = ( ...args ) =>
	{
		lines.push( ...args.join( ' ' ).split( "\n" ) );
	};

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

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
	} );

	it( 'should handle rest on empty arguments', ( ) =>
	{
		const result = oppa( ).parse( [ 'foo' ] );

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ 'foo' ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
	} );

	it( 'should throw on already existing (long) name', ( ) =>
	{
		const parser = ( ) =>
			oppa( )
			.add( { name: 'foo', type: 'string' } )
			.add( { name: 'bar', type: 'string' } )
			.add( { name: 'foo', type: 'string' } );

		expect( parser ).toThrow( /'foo'.*already added/ );
	} );

	it( 'should throw on conflicting auto-negated long name', ( ) =>
	{
		const parser1 = ( ) =>
			oppa( )
			.add( { name: 'foo', type: 'boolean' } )
			.add( { name: 'bar', type: 'boolean' } )
			.add( { name: 'no-foo', type: 'boolean' } );

		expect( parser1 ).toThrow( /fo.*already added/ );

		const parser2 = ( ) =>
			oppa( )
			.add( { name: 'no-foo', type: 'boolean' } )
			.add( { name: 'foo', type: 'boolean' } )
			.add( { name: 'bar', type: 'boolean' } );

		expect( parser2 ).toThrow( /fo.*already added/ );
	} );

	it( 'should throw on already existing (short) name', ( ) =>
	{
		const parser = ( ) =>
			oppa( )
			.add( { name: 'foo', type: 'string', alias: 'f' } )
			.add( { name: 'bar', type: 'string', alias: 'b' } )
			.add( { name: 'baz', type: 'string', alias: 'b' } );

		expect( parser ).toThrow( /'b'.*already added/ );
	} );

	it( 'should handle multiple short aliases', ( ) =>
	{
		const result =
			oppa( )
			.add( { name: 'foo', type: 'string', alias: [ 'f', 'o' ] } )
			.parse( [ '-o', 'bar' ] );

		expect( result.args ).toStrictEqual( { 'foo': 'bar' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
	} );

	it( 'should handle long alias', ( ) =>
	{
		const result =
			oppa( )
			.add( { name: 'foo', type: 'string', alias: 'bar' } )
			.parse( [ '--bar', 'baz' ] );

		expect( result.args ).toStrictEqual( { 'foo': 'baz' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
	} );

	it( 'should handle multiple long aliases', ( ) =>
	{
		const result =
			oppa( )
			.add( { name: 'foo', type: 'string', alias: [ 'bar', 'baz' ] } )
			.parse( [ '--baz', 'bay' ] );

		expect( result.args ).toStrictEqual( { 'foo': 'bay' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
	} );

	it( 'should handle mix of short and long aliases', ( ) =>
	{
		const result =
			oppa( )
			.add( { name: 'foo', type: 'string', alias: [ 'bar', 'f', 'baz' ] } )
			.parse( [ '-f', 'bay' ] );

		expect( result.args ).toStrictEqual( { 'foo': 'bay' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { add: false } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { add: true } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { add: true } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { add: false } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { add: true } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { add: false } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( parser ).toThrow( 'usage' );
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

		expect( parser ).toThrow( 'usage' );
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

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: '' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 'bar' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 'bar' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: '' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 'bar' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: '' } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 0 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 1 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 1 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 0 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( parse ).toThrow( );
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

		expect( parse ).toThrow( "Invalid numeric" );
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

		expect( result.args ).toStrictEqual( { foo: 1 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 0 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( helpLine.length ).toBe( 1 );
		expect( helpLine[ 0 ] ).toContain( "help" );
	} );

	it( 'should not print --version unless version is provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( ).showHelp( );

		cleanup( );

		const verLine = lines.filter( line => /-v, --version/.test( line ) );

		expect( verLine.length ).toBe( 0 );
	} );

	it( 'should print --version if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { version: '0.0.1' } ).showHelp( );

		cleanup( );

		const verLine = lines.filter( line => /-v, --version/.test( line ) );

		expect( verLine.length ).toBe( 1 );
		expect( verLine[ 0 ] ).toContain( "version" );
	} );

	it( 'should print --version if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { noExit: true, version: '0.0.1' } ).parse( [ '-v' ] );

		cleanup( );

		expect( lines ).toStrictEqual( [ '0.0.1' ] );
	} );

	it( 'should print --help if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { noExit: true } ).parse( [ '-h' ] );

		cleanup( );

		expect( lines.filter( line => /Usage:/.test( line ) ).length )
			.toBe( 1 );
	} );

	it( 'should print custom usage if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		const usage = "foo bar";

		oppa( { usage } ).showHelp( );

		cleanup( );

		const helpLine = lines.filter( line => /Usage: foo bar/.test( line ) );

		expect( helpLine.length ).toBe( 1 );
	} );

	it( 'should print custom argumentName if provided', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( )
			.add( {
				type: 'string',
				name: "foo",
				argumentName: "bar",
			} )
			.showHelp( );

		cleanup( );

		const helpLine = lines
			.filter( line => /--foo/.test( line ) )
			[ 0 ];

		expect( helpLine.trim( ) ).toBe( "--foo <bar>" );
	} );

	describe( 'groups', ( ) =>
	{
		it( 'show group colors', ( ) =>
		{
			const { lines, cleanup } = mockConsoleLog( );

			const opts =
				oppa( )
				.add( { name: 'foo', type: 'number' } )
				.group( { name: "At the bar", backgroundColor: 'green' } )
				.add( { name: 'bar', type: 'boolean', description: "#SDT" } )
				.add( { name: 'baz', type: 'string', description: "Misspled" } )
				.group( { name: "At the zoo", backgroundColor: 'purple' } )
				.add( { name: 'zoo', type: 'boolean', description: "Animals" } )
				.add( { name: 'zoe', type: 'string', description: "Her name" } );

			const result = opts.showHelp( );

			cleanup( );

			expect( lines ).toMatchSnapshot( );
		} );
	} );
} );

describe( 'version', ( ) =>
{
	it( 'should print version on -v', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { version: '1.2.3', noExit: true } ).parse( [ '-v' ] );

		cleanup( );

		expect( lines ).toStrictEqual( [ '1.2.3' ] );
	} );

	it( 'should print version and program name on -v', ( ) =>
	{
		const { lines, cleanup } = mockConsoleLog( );

		oppa( { version: '1.2.3', name: 'foo', noExit: true } )
			.parse( [ '-v' ] );

		cleanup( );

		expect( lines ).toStrictEqual( [ 'foo 1.2.3' ] );
	} );
} );

describe( 'no help/version aliases', ( ) =>
{
	it( "shouldn't use -h if noHelpAlias", ( ) =>
	{
		const { args: { host } } =
			oppa( {
				version: '1.2.3',
				noHelpAlias: true,
				noExit: true,
			} )
			.add( {
				name: "host",
				alias: "h",
				type: "string",
			} )
			.parse( [ '-h', 'foo' ] );

		expect( host ).toStrictEqual( "foo" );
	} );

	it( "shouldn't use -v if noVersionAlias", ( ) =>
	{
		const { args: { verbose } } =
			oppa( {
				version: '1.2.3',
				name: 'foo',
				noVersionAlias: true,
				noExit: true,
			} )
			.add( {
				name: "verbose",
				alias: "v",
				type: "boolean",
			} )
			.parse( [ '-v' ] );

		expect( verbose ).toStrictEqual( true );
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

		expect( parser ).toThrow( 'Unknown' );
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

		expect( result.args ).toStrictEqual( { foo: 0 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [
			{ name: 'g', value: undefined }
		] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: 0 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [
			{ name: 'g', value: 'x' }
		] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: false } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { foo: false } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown )
			.toStrictEqual( [ { name: 'no-foo', value: undefined } ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( fooLine ).toContain( "default: 1" );
		expect( result.args ).toStrictEqual( { foo: 2 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( parser ).toThrow( 'Invalid argument' );
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

		expect( result.args ).toStrictEqual( { foo: 2 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( parser ).toThrow( 'Invalid argument' );
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

		expect( result.args ).toStrictEqual( { foo: 2 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
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

		expect( numA ).toBe( 1 );
		expect( numB ).toBe( 1 );
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

		expect( numA ).toBe( 1 );
		expect( numB ).toBe( 1 );
		expect( numC ).toBe( 1 );
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

		expect( numA ).toBe( 1 );
		expect( numB ).toBe( 1 );
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

		expect( numA ).toBe( 1 );
		expect( numB ).toBe( 1 );
		expect( numC ).toBe( 1 );
	} );
} );

describe( 'dash-dash', ( ) =>
{
	it( 'should handle only empty dash-dash', ( ) =>
	{
		const result =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
			} )
			.parse( [ '--' ] );

		expect( result.args ).toStrictEqual( { } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ '--' ] );
	} );

	it( 'should handle empty dash-dash after arguments', ( ) =>
	{
		const result =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
			} )
			.parse( [ '--foo', '47', '--' ] );

		expect( result.args ).toStrictEqual( { foo: 47 } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ '--' ] );
	} );

	it( 'should handle empty dash-dash after rest', ( ) =>
	{
		const result =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
			} )
			.parse( [ '--foo', '47', 'bar', '--' ] );

		expect( result.args ).toStrictEqual( { foo: 47 } );
		expect( result.rest ).toStrictEqual( [ 'bar' ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ '--' ] );
	} );

	it( 'should handle data after dash-dash after rest', ( ) =>
	{
		const result =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
			} )
			.parse( [ '--foo', '47', 'bar', '--', 'baz' ] );

		expect( result.args ).toStrictEqual( { foo: 47 } );
		expect( result.rest ).toStrictEqual( [ 'bar' ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ '--', 'baz' ] );
	} );
} );

describe( 'multi', ( ) =>
{
	it( 'should handle multi-args and stop at next arg', ( ) =>
	{
		const result =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				multi: true,
			} )
			.add( {
				name: 'bar',
				type: 'boolean',
			} )
			.parse( [ '--foo', '1', '2', '3', '--bar' ] );

		expect( result.args ).toStrictEqual( { foo: [ 1, 2, 3 ], bar: true } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ ] );
	} );

	it( 'should handle multi-args and stop at dash-dash', ( ) =>
	{
		const result =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
				multi: true,
			} )
			.add( {
				name: 'bar',
				type: 'boolean',
			} )
			.parse( [ '--foo', '1', '2', '3', '--' ] );

		expect( result.args ).toStrictEqual( { foo: [ 1, 2, 3 ] } );
		expect( result.rest ).toStrictEqual( [ ] );
		expect( result.unknown ).toStrictEqual( [ ] );
		expect( result.dashdash ).toStrictEqual( [ '--' ] );
	} );
} );

describe( 'typeof', ( ) =>
{
	it( 'should TypeOf properly', ( ) =>
	{
		const opts =
			oppa( )
			.add( {
				name: 'foo',
				type: 'number',
			} )
			.add( {
				name: 'bar',
				type: 'boolean',
			} );
		const result = opts.parse( [ '--foo', '1', '--bar' ] );

		expect( typeof result.args.foo ).toBe( 'number' );
		expect( typeof result.args.bar ).toBe( 'boolean' );

		const reTypedResult: TypeOf< typeof opts > = result;

		expect( reTypedResult.args.foo ).toBe( 1 );
		expect( reTypedResult.args.bar ).toBe( true );
	} );
} );

// TODO: Test description
//       Test values
//       Test examples
//       Test match
