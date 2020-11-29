import { Argument, ArgumentType, ValidatorFunction } from "./types"


export function validate(
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

export function arrayify< T >( value: T | Array< T > | ReadonlyArray< T >  )
: Array< T >;
export function arrayify< T >( value: T | Array< T > ): Array< T >
{
	if ( value == null )
		return [ ];
	else if ( Array.isArray( value ) )
		return [ ...value ];
	else
		return [ value ];
}
