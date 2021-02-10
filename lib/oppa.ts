import { tableIndent } from "./constants"
import {
	FlatTableRow,
	flattenTable,
	GetExtraDescriptionRowsFunction,
	PrintableRows,
	printTable,
} from "./table"
import {
	Argument,
	ArgumentAsString,
	ArgumentType,
	Description,
	Group,
	GroupTag,
	isArgument,
	isGroup,
} from "./types"
import { arrayify, validate } from "./util"


export interface OppaOptions
{
	name: string;
	version: string;
	usage: string;
	description: Description;
	noHelp: boolean;
	noHelpAlias: boolean;
	noVersionAlias: boolean;
	allowUnknown: boolean;
	throwOnError: boolean;
	noExit: boolean;
}

const defaultOptions: OppaOptions = {
	name: null,
	version: null,
	usage: null,
	description: null,
	noHelp: false,
	noHelpAlias: false,
	noVersionAlias: false,
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

export class Oppa< U >
{
	private readonly opts: OppaOptions;
	private readonly arguments: Array< Argument | GroupTag > = [ ];
	private byLongs: Map< string, Argument > = new Map( );
	private byShorts: Map< string, Argument > = new Map( );

	constructor( opts: OppaOptions )
	{
		this.opts = opts;

		this.add( {
			name: 'help',
			type: 'boolean',
			...( !opts.noHelpAlias ? { alias: 'h' } : { } ),
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
				...( !opts.noVersionAlias ? { alias: 'v' } : { } ),
				description: 'Print the program version',
				negatable: false,
				match: ( ) =>
				{
					this.showVersion( true );
					return true;
				},
			} );
	}

	group( group: Group ): Oppa< U >
	{
		this.arguments.push( { isGroup: true, ...group } );
		return this;
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
		shorts.forEach( short =>
		{
			if ( this.byShorts.has( short ) )
				throw new Error( `name alias '${short}' already added` );

			this.byShorts.set( short, argument );
		} );
		longs.forEach( long =>
		{
			if ( this.byLongs.has( long ) )
				throw new Error( `name alias '${long}' already added` );

			this.byLongs.set( long, argument );

			if ( argument.type === 'boolean' && argument.negatable !== false )
			{
				if ( this.byLongs.has( 'no-' + long ) )
					throw new Error( `name alias 'no-${long}' already added` );

				this.byLongs.set( 'no-' + long, argument );
			}
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
			.filter( isArgument )
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

	showVersion< Exit extends boolean >( exit: Exit = false as Exit )
	// @ts-ignore
	: Exit extends true ? never : void
	{
		const prefix = this.opts.name ? this.opts.name + " " : "";

		console.log( prefix + this.opts.version );

		if ( exit && !this.opts.noExit )
			process.exit( 0 );
	}

	showHelp< Exit extends boolean >( exit: Exit = false as Exit )
	// @ts-ignore
	: Exit extends true ? never : void
	{
		const line = ( ...texts: Array< string > ) =>
			console.log( "  ", ...texts );

		const name = this.opts.name ? ( this.opts.name + " " ) : "";
		line( );
		if ( this.opts.usage )
			line( "Usage: " + this.opts.usage );
		else
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

		const valueify = ( argument: Argument ) =>
			argument.type === 'boolean'
			? ''
			: argument.multi
			? ` <${argument.argumentName ?? argument.name}...>`
			: ` <${argument.argumentName ?? argument.name}>`;

		let currentGroup: undefined | GroupTag = undefined;

		const args = this.arguments
		.map( argument =>
		{
			if ( !isArgument( argument ) )
			{
				currentGroup = argument;
				return argument;
			}
			else
			{
				const name =
					shortFirst( [
						argument.name,
						...arrayify( argument.alias )
					] )
					.map( name => dashify( name, argument ) )
					.join( ', ' )
					+ valueify( argument );

				return { name, argument, currentGroup };
			}
		} )
		.filter( ( v ): v is NonNullable< typeof v > => !!v );

		if ( args.length )
		{
			line( "Options:" );
			line( );
		}

		const rows: PrintableRows = args
		.map( ( row ): FlatTableRow =>
		{
			if ( isGroup( row ) )
			{
				return {
					key: row.name,
					desc: [ ],
					group: row,
					isGroup: true,
				};
			}

			const { name, argument } = row;
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

			const getExtraDescriptionRows: GetExtraDescriptionRowsFunction =
				( ) =>
			{
				const ret: Array< string > = [ ];

				const values = flattenTable( argument.values );
				if ( values.length > 0 )
				{
					ret.push( "" );
					ret.push( "   Values:" );
					ret.push( ...printTable( 6, values ) );
				}

				const examples = flattenTable( argument.example );
				if ( examples.length > 0 )
				{
					ret.push( "" );
					ret.push( "   Example:" );
					ret.push( ...printTable( 6, examples ) );
				}

				if ( values.length > 0 || examples.length > 0 )
					ret.push( "" );

				return ret;
			};

			return {
				key: name,
				desc: [ firstDescription, ...rest ],
				group: row.currentGroup,
				getExtraDescriptionRows,
			};
		} );
		console.log( printTable( tableIndent, rows ).join( "\n" ) + "\n" );

		if ( exit && !this.opts.noExit )
			process.exit( 0 );
	}
}

export function oppa( opts?: Partial< OppaOptions > ): Oppa< { } >
{
	return new Oppa< { } >( Object.assign( { }, defaultOptions, opts ) );
}

export type TypeOf< T > = T extends Oppa< infer U > ? Result< U > : never;
