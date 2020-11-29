
export type Description = string | ReadonlyArray< string >;

export type TableRow = { [ left: string ]: Description };
export type TableRows = ReadonlyArray< TableRow >;
export type Table = TableRow | TableRows;

export type ArgumentType = string | boolean | number;

export type ValidatorFunction< T = any > =
	( value: T, rawValue: string, argument: Argument ) => boolean;

export type Validator< T > = RegExp | ValidatorFunction< T >;

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

export interface NamedArgument
{
	argumentName?: string;
}

export type ArgumentAsString = { type: 'string'; } &
	NamedArgument &
	( DefaultableSingle< string > | DefaultableMulti< string > );

export type ArgumentAsBoolean = { type: 'boolean'; } &
	DefaultableSingle< boolean >;

export type ArgumentAsNumber = { type: 'number'; } &
	NamedArgument &
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

export interface Style
{
	color?: string;
	backgroundColor?: string;
}

export interface Group extends Style
{
	name: string;
}

export interface GroupTag extends Group
{
	isGroup: true;
}

export const isArgument = ( arg: Argument | GroupTag ): arg is Argument =>
	!( arg as GroupTag ).isGroup;

export const isGroup = < T >( arg: T | GroupTag ): arg is GroupTag =>
	( arg as GroupTag ).isGroup;
