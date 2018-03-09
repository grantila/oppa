export declare type ArgumentType = string | boolean | number;
export declare type Description = string | ReadonlyArray<string>;
export declare type ValidatorFunction<T = any> = (value: T, rawValue: string, argument: Argument) => boolean;
export declare type Validator<T> = RegExp | ValidatorFunction<T>;
export declare type TableRow = {
    [left: string]: Description;
};
export declare type TableRows = ReadonlyArray<TableRow>;
export declare type Table = TableRow | TableRows;
export interface DefaultableSingle<T> {
    multi?: false;
    default?: T;
    realDefault?: T;
    match?: Validator<T>;
}
export interface DefaultableMulti<T> {
    multi: true;
    default?: ReadonlyArray<T>;
    realDefault?: ReadonlyArray<T>;
    match?: Validator<T>;
}
export declare type ArgumentAsString = {
    type: 'string';
} & (DefaultableSingle<string> | DefaultableMulti<string>);
export declare type ArgumentAsBoolean = {
    type: 'boolean';
} & DefaultableSingle<boolean>;
export declare type ArgumentAsNumber = {
    type: 'number';
} & (DefaultableSingle<number> | DefaultableMulti<number>);
export declare type TypedArgument = ArgumentAsString | ArgumentAsBoolean | ArgumentAsNumber;
export interface BaseArgument<Name extends string> {
    /**
     * The argument name (the long name)
     */
    name: Name;
    /**
     * The data type representing this argument
     */
    /**
     * A multi-argument takes more than one value. It consumes all
     * non-dash-beginning arguments as values.
     */
    /**
     * Shortcut (one character) alias of the argument
     */
    alias?: string | ReadonlyArray<string>;
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
    /**
     * The *real* default-value (not printed in the help section but used
     * run-time)
     */
    /**
     * The extra arguments handled by this argument.
     *
     * Should be on the form "<required>", "[optional]" or "[multi...]" or a
     * combination of these.
     *
     * Can not be used if <values> are provided
     */
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
}
export declare type Argument<Name extends string = string> = BaseArgument<Name> & TypedArgument;
export interface ArpaOptions {
    name: string;
    version: string;
    description: Description;
    noHelp: boolean;
    allowUnknown: boolean;
    throwOnError: boolean;
    noExit: boolean;
}
export declare type ArpaSingleString = {
    type: 'string';
    multi?: false;
};
export declare type ArpaSingleBoolean = {
    type: 'boolean';
    multi?: false;
};
export declare type ArpaSingleNumber = {
    type: 'number';
    multi?: false;
};
export declare type ArpaMultiString = {
    type: 'string';
    multi: true;
};
export declare type ArpaMultiBoolean = {
    type: 'boolean';
    multi: true;
};
export declare type ArpaMultiNumber = {
    type: 'number';
    multi: true;
};
export declare type Unknown = Array<{
    name: string;
    value: string;
}>;
export interface Result<Arguments> {
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
    rest: Array<string>;
    /**
     * '--' *and* the arguments after '--'
     */
    dashdash: Array<string>;
}
export declare type Arpifyer<Name extends string, Type> = {
    [P in Name]: Type;
};
export declare class Arpa<U> {
    private readonly opts;
    private readonly arguments;
    private byLongs;
    private byShorts;
    constructor(opts: ArpaOptions);
    add<T extends string>(argument: Argument<T> & ArpaSingleString): Arpa<U & Arpifyer<T, string>>;
    add<T extends string>(argument: Argument<T> & ArpaSingleBoolean): Arpa<U & Arpifyer<T, boolean>>;
    add<T extends string>(argument: Argument<T> & ArpaSingleNumber): Arpa<U & Arpifyer<T, number>>;
    add<T extends string>(argument: Argument<T> & ArpaMultiString): Arpa<U & Arpifyer<T, Array<string>>>;
    add<T extends string>(argument: Argument<T> & ArpaMultiBoolean): Arpa<U & Arpifyer<T, Array<boolean>>>;
    add<T extends string>(argument: Argument<T> & ArpaMultiNumber): Arpa<U & Arpifyer<T, Array<number>>>;
    private _parse(_args);
    parse(args?: ReadonlyArray<string>): Result<U>;
    showVersion(exit?: boolean): void;
    showHelp(exit?: boolean): void;
}
export declare function arpa(opts?: Partial<ArpaOptions>): Arpa<{}>;
