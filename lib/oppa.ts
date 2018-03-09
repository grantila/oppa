'use strict'

export type ArgumentType = string | boolean | number;

export type Description = string | ReadonlyArray< string >;

export type ValidatorFunction< T = any > =
	( value: T, rawValue: string, argument: Argument ) => boolean;

export type Validator< T > = RegExp | ValidatorFunction< T >;

export type TableRow = { [ left: string ]: Description };
export type TableRows = ReadonlyArray< TableRow >;
export type Table = TableRow | TableRows;

export interface DefaultableSingle< T >
{
	multi?: false;
	default?: T;
	realDefault?: T;
	match?: Validator< T >;
}

export interface DefaultableMulti< T >
{
	multi: true;
	default?: ReadonlyArray< T >;
	realDefault?: ReadonlyArray< T >;
	match?: Validator< T >;
}

export type ArgumentAsString = { type: 'string'; } &
	( DefaultableSingle< string > | DefaultableMulti< string > );

export type ArgumentAsBoolean = { type: 'boolean'; } &
	DefaultableSingle< boolean >;

export type ArgumentAsNumber = { type: 'number'; } &
	( DefaultableSingle< number > | DefaultableMulti< number > );

export type TypedArgument =
	ArgumentAsString | ArgumentAsBoolean | ArgumentAsNumber;

export interface BaseArgument< Name extends string >
{
	/**
	 * The argument name (the long name)
	 */
	name: Name;

	/**
	 * The data type representing this argument
	 */
	//type: 'string' | 'boolean' | 'number';

	/**
	 * A multi-argument takes more than one value. It consumes all
	 * non-dash-beginning arguments as values.
	 */
	//multi?: boolean;

	/**
	 * Shortcut (one character) alias of the argument
	 */
	alias?: string | ReadonlyArray< string >;

	/**
	 * Description of the argument (can be multi-lined by providing an array)
	 */
	description?: Description;

	/**
	 * Defines whether the argument is negatable or not (--arg vs --no-arg)
	 *
	 * Defaults to true for boolean arguments and false for other.
	 */
	negatable?: boolean;

	/**
	 * The default-value
	 */
	//default?: ArgumentType;

	/**
	 * The *real* default-value (not printed in the help section but used
	 * run-time)
	 */
	//realDefault?: ArgumentType;

	/**
	 * The extra arguments handled by this argument.
	 *
	 * Should be on the form "<required>", "[optional]" or "[multi...]" or a
	 * combination of these.
	 *
	 * Can not be used if <values> are provided
	 */
	//args?: string;

	/**
	 * Hard-coded list of acceptable values and/or values provided to the help
	 * screen.
	 *
	 * By default, values specified cause them to be matched against the input
	 * for validation (which can be over-ruled by <match>) and will be used to
	 * show the user possible values.
	 *
	 * The keys in this object represent the argument string and the value is
	 * a description of it (as a string or an array of strings).
	 *
	 * Can not be used if <args> are provided
	 */
	values?: Table;

	/**
	 * A list of examples. Each example is an object with a key being the
	 * particular example string, and the value is a description as a string
	 * or array of strings.
	 */
	example?: Table;

	/**
	 * A matcher function or regex which validates the input
	 */
	//match?: Validator,
}

export type Argument< Name extends string = string > =
	BaseArgument< Name > & TypedArgument;

export interface OppaOptions
{
	name: string;
	version: string;
	description: Description;
	noHelp: boolean;
	allowUnknown: boolean;
	throwOnError: boolean;
	noExit: boolean;
}

const defaultOptions: OppaOptions = {
	name: null,
	version: null,
	description: null,
	noHelp: false,
	allowUnknown: false,
	throwOnError: false,
	noExit: false,
};

export type OppaSingleString = { type: 'string'; multi?: false; };
export type OppaSingleBoolean = { type: 'boolean'; multi?: false; };
export type OppaSingleNumber = { type: 'number'; multi?: false; };
export type OppaMultiString = { type: 'string'; multi: true; };
export type OppaMultiBoolean = { type: 'boolean'; multi: true; };
export type OppaMultiNumber = { type: 'number'; multi: true; };

export type Unknown = Array< { name: string; value: string; } >;

export interface Result< Arguments >
{
	/**
	 * Parsed arguments
	 */
	args: Arguments;

	/**
	 * Unknown arguments
	 */
	unknown: Unknown;

	/**
	 * "Commands" after the last argument (but before '--')
	 */
	rest: Array< string >;

	/**
	 * '--' *and* the arguments after '--'
	 */
	dashdash: Array< string >;
}

export type Oppifyer< Name extends string, Type > = { [ P in Name ]: Type };

function parseArg( text: string )
{
	const pos = text.indexOf( '=' );

	if ( pos === -1 )
		return { name: text };

	return {
		name: text.substr( 0, pos ),
		value: text.substr( pos + 1 ),
	};
};

function parseValue( value: string, argument: Argument, raw: string )
{
	if ( argument.type === 'number' )
	{
		const num = Number( value );
		if ( ( '' + num ) !== value )
			throw new Error( "Invalid numeric value: " + value );
		return num;
	}

	if ( argument.type === 'boolean' )
	{
		throw new Error( "Invalid usage of boolean argument: " + raw );
	}

	return value;
};

function validate(
	value: ArgumentType,
	raw: string,
	argument: Argument
)
{
	if ( !argument.match )
		return;

	const result =
		( typeof argument.match === 'function' )
		? ( < ValidatorFunction >argument.match )( value, raw, argument )
		: argument.match.test( raw )

	if ( !result )
		throw new Error( `Invalid argument for ${argument.name}: ${value}` );
}

function arrayify< T >( value: T | Array< T > | ReadonlyArray< T >  )
: Array< T >;
function arrayify< T >( value: T | Array< T > ): Array< T >
{
	if ( value == null )
		return [ ];
	else if ( Array.isArray( value ) )
		return [ ...value ];
	else
		return [ value ];
}

type FlatTableRow = { key: string; desc: ReadonlyArray< string >; };
type PrintableRows =
	ReadonlyArray< FlatTableRow & { handler?: ( width: number ) => void; } >;

function flattenTable( table?: Table )
{
	const rows =
		!table
		? [ ] as TableRows
		: !Array.isArray( table )
		? [ < TableRow >table ] as TableRows
		: table as TableRows;

	return ( [ ] as FlatTableRow[ ] ).concat(
		...
		rows
		.map( obj =>
			Object.keys( obj )
			.map( key => ( { key, desc: arrayify( obj[ key ] ) } ) )
		)
	);
}

export class Oppa< U >
{
	private readonly opts: OppaOptions;
	private readonly arguments: Array< Argument > = [ ];
	private byLongs: Map< string, Argument > = new Map( );
	private byShorts: Map< string, Argument > = new Map( );

	constructor( opts: OppaOptions )
	{
		this.opts = opts;

		this.add( {
			name: 'help',
			type: 'boolean',
			alias: 'h',
			description: 'Print (this) help screen',
			negatable: false,
			match: ( ) =>
			{
				this.showHelp( true );
				return true;
			},
		} );

		if ( this.opts.version )
			this.add( {
				name: 'version',
				type: 'boolean',
				alias: 'v',
				description: 'Print the program version',
				negatable: false,
				match: ( ) =>
				{
					this.showVersion( true );
					return true;
				},
			} );
	}

	add< T extends string >( argument: Argument< T > & OppaSingleString )
		: Oppa< U & Oppifyer< T, string > >;
	add< T extends string >( argument: Argument< T > & OppaSingleBoolean )
		: Oppa< U & Oppifyer< T, boolean > >;
	add< T extends string >( argument: Argument< T > & OppaSingleNumber )
		: Oppa< U & Oppifyer< T, number > >;
	add< T extends string >( argument: Argument< T > & OppaMultiString )
		: Oppa< U & Oppifyer< T, Array< string > > >;
	add< T extends string >( argument: Argument< T > & OppaMultiBoolean )
		: Oppa< U & Oppifyer< T, Array< boolean > > >;
	add< T extends string >( argument: Argument< T > & OppaMultiNumber )
		: Oppa< U & Oppifyer< T, Array< number > > >;

	add< T extends string >( _argument: Argument )
	: Oppa< U & Oppifyer< T, any > >
	{
		const argument = { ..._argument };

		const alias = !argument.alias
			? [ ]
			: Array.isArray( argument.alias )
			? argument.alias
			: [ argument.alias ];
		const names = [ argument.name, ...alias ];

		const shorts = names.filter( name => name.length === 1 );
		const longs = names.filter( name => name.length > 1 );

		argument.negatable =
			argument.type !== 'boolean'
			? false
			: 'negatable' in argument
			? argument.negatable
			: true;

		this.arguments.push( argument );
		shorts.forEach( short => this.byShorts.set( short, argument ) );
		longs.forEach( long =>
		{
			this.byLongs.set( long, argument );

			if ( argument.type === 'boolean' && argument.negatable !== false )
				this.byLongs.set( 'no-' + long, argument );
		} );

		// Best cast ever
		return < any >this;
	}

	private _parse( _args: ReadonlyArray< string > ): Result< U >
	{
		const dashdashPos = _args.indexOf( '--' );
		const dashdash = dashdashPos === -1 ? [ ] : _args.slice( dashdashPos );
		_args =
			dashdashPos === -1
			? [ ..._args ]
			: _args.slice( 0, dashdashPos );

		const args: any = { };
		const unknown: Unknown = [ ];
		const rest: Array< string > = [ ];

		const setValue = ( argument: Argument, value: ArgumentType ) =>
		{
			if ( ( < ArgumentAsString >argument ).multi )
			{
				if ( !args[ argument.name ] )
					args[ argument.name ] = [ value ];
				else
					args[ argument.name ].push( value );
			}
			else
				args[ argument.name ] = value;
		};

		const handleArgument =
		(	raw: string,
			name: string,
			value: string,
			long: boolean,
			squeezed: boolean
		) =>
		{
			if ( name.length > 1 && !long )
			{
				// Merged shortcuts, take care of all up until last (treat as
				// booleans)
				while ( name.length > 1 )
				{
					const short = name.charAt( 0 );
					name = name.substr( 1 );

					handleArgument( '-' + short, short, null, false, true );
				}
			}

			const argument = long
				? this.byLongs.get( name )
				: this.byShorts.get( name );

			if ( !argument )
			{
				if ( this.opts.allowUnknown )
				{
					unknown.push( { name, value } );
					return;
				}
				else
					throw new Error( "Unknown argument: " + raw );
			}

			if ( value != null )
			{
				const typedValue = parseValue( value, argument, raw );

				validate( typedValue, value, argument );

				setValue( argument, typedValue );

				return;
			}

			if ( argument.type === 'boolean' )
			{
				// TODO: Change this logic to work with long aliases
				const negated = name === ( 'no-' + argument.name );

				validate( !negated, value, argument );

				setValue( argument, !negated );

				return;
			}

			// Argument value is the next (and potentially subsequent)
			// arguments
			return argument;
		};

		for ( let i = 0; i < _args.length; ++i )
		{
			const arg = _args[ i ];

			if ( arg.charAt( 0 ) !== '-' )
			{
				rest.push( ..._args.slice( i ) );
				break;
			}

			const long = arg.charAt( 1 ) === '-';

			const { name, value } = parseArg( arg.substr( long ? 2 : 1 ) );

			if ( name.indexOf( '-' ) !== -1 && !long )
				throw new Error( "Invalid argument: " + arg );

			const argument = handleArgument( arg, name, value, long, false );

			if ( argument )
			{
				const setNextValue = ( value: string ) =>
				{
					const typedValue = parseValue( value, argument, value );

					validate( typedValue, value, argument );

					setValue( argument, typedValue );
				};

				if ( !( < ArgumentAsString >argument ).multi )
				{
					// Next argument is the value of this argument
					++i;
					if ( _args.length === i )
						throw new Error( "Missing value for argument " + arg );

					setNextValue( _args[ i ] );
				}
				else
				{
					// Use values up until an argument begins with '-'
					// TODO: Reconsider. Maybe allow values that begin with '-'
					//       but aren't arguments. Maybe implement a list of
					//       sub-commands that can be detected.
					for ( ++i; i < _args.length; ++i )
					{
						const value = _args[ i ];
						if ( value.startsWith( '-' ) )
						{
							--i;
							break;
						}
						setNextValue( value );
					}
				}
			}
		}

		this.arguments
			.filter( argument =>
				( 'default' in argument ) || ( 'realDefault' in argument )
			)
			.forEach( argument =>
			{
				const theDefault =
					'realDefault' in argument
					? argument.realDefault
					: argument.default;

				if ( !( argument.name in args ) )
					args[ argument.name ] = theDefault;
			} );

		return { args, unknown, rest, dashdash };
	}

	parse( args?: ReadonlyArray< string > ): Result< U >
	{
		if ( !args )
		{
			args = process.argv.slice( 2 );
			if ( !this.opts.name )
			{
				const reProgramName = /.*\/(.+)(\.[tj]s)?$/;
				const m = ( "/" + process.argv[ 1 ] ).match( reProgramName );
				this.opts.name = m[ 1 ] || null;
			}
		}

		try
		{
			return this._parse( args );
		}
		catch ( err )
		{
			if ( this.opts.throwOnError )
				throw err;
			console.error( err.message );
			this.showHelp( true );
		}
	}

	showVersion( exit = false ): void
	{
		const prefix = this.opts.name ? this.opts.name + " " : "";

		console.log( prefix + this.opts.version );

		if ( exit && !this.opts.noExit )
			process.exit( 0 );
	}

	showHelp( exit = false ): void
	{
		const line = ( ...texts: Array< string > ) =>
			console.log( "  ", ...texts );

		const name = this.opts.name ? ( this.opts.name + " " ) : "";
		line( );
		line( "Usage: " + name + "[options]" );
		line( );

		if ( this.opts.description )
		{
			const lines =
				Array.isArray( this.opts.description )
				? this.opts.description
				: [ this.opts.description ];

			lines.forEach( l => line( l ) );
			line( );
		}

		const shortFirst = ( list: ReadonlyArray< string > ) =>
		{
			const short = list.filter( text => text.length === 1 );
			const long = list.filter( text => text.length > 1 );
			return [ ...short, ...long ];
		}

		const dashify = ( text: string, argument: Argument ) =>
			text.length === 1
			? `-${text}`
			: argument.negatable
			? `--(no-)${text}`
			: `--${text}`;

		const widenLeft = ( text: string, width: number ) =>
			' '.repeat( width - text.length ) + text;
		const widenRight = ( text: string, width: number ) =>
			text + ' '.repeat( width - text.length );

		const valueify = ( argument: Argument ) =>
			argument.type === 'boolean'
			? ''
			: argument.multi
			? ` <${argument.name}...>`
			: ` <${argument.name}>`;

		const printTable = ( indent: number, rows: PrintableRows ) =>
		{
			const width = 
				rows
				.map( row => row.key.length )
				.sort( ( a, b ) => b - a )
				[ 0 ];

			const prefix = " ".repeat( indent );

			rows.forEach( ( { key, desc, handler } ) =>
			{
				const [ first, ...rest ] = desc;

				line(
					prefix +
					widenRight( key, width ) +
					"   " +
					first
				);
				rest.forEach( text =>
					line(
						prefix +
						widenRight( '', width ) +
						"   " +
						text
					)
				);
	
				handler && handler( indent + width );
			} );
		};

		const args = this.arguments.map( argument =>
		{
			const name =
				shortFirst( [ argument.name, ...arrayify( argument.alias ) ] )
				.map( name => dashify( name, argument ) )
				.join( ', ' )
				+ valueify( argument );

			return { name, argument };
		} );

		if ( args.length )
		{
			line( "Options:" );
			line( );
		}

		const rows: PrintableRows = args
		.map( ( { name, argument } ) =>
		{
			const description =
				!argument.description
				? [ '' ]
				: arrayify( argument.description );
			const defaultValue =
				'default' in argument
				? ` (default: ${argument.default})`
				: '';

			const [ first, ...rest ] = description;

			const firstDescription =
				rest.length > 0
				? first
				: ( first + defaultValue );

			if ( rest.length > 0 && defaultValue )
				rest.push( defaultValue );

			const handler = ( width: number ) =>
			{
				const prefix = " ".repeat( width );

				const values = flattenTable( argument.values );
				if ( values.length > 0 )
				{
					line( );
					line( prefix + "   Values:" );
					printTable( width + 6, values );
				}

				const examples = flattenTable( argument.example );
				if ( examples.length > 0 )
				{
					line( );
					line( prefix + "   Example:" );
					printTable( width + 6, examples );
				}

				if ( values.length > 0 || examples.length > 0 )
					line( );
			};

			return {
				key: name,
				desc: [ firstDescription, ...rest ],
				handler,
			};
		} );
		printTable( 3, rows );

		line( );

		if ( exit && !this.opts.noExit )
			process.exit( 0 );
	}
}

export function oppa( opts?: Partial< OppaOptions > ): Oppa< { } >
{
	return new Oppa< { } >( Object.assign( { }, defaultOptions, opts ) );
}
