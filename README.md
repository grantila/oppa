[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![coverage status][coverage-image]][coverage-url]


<img src="arpa.svg" width="100%" />

Arpa is an **ar**gument **pa**rser (also known as *options parser*).

It is very easy to use, yet powerful, and if used from TypeScript, the parsed result will have types matching the parse configuration.

By default, arpa creates `--help` (and `-h`) arguments which it uses to produce a help output, describing the arguments. If a version is provided, it creates `--version` and `-v` too.


# Features

- Typesafe parse result **(unique feature)**
- Handles `--long` and `-short` names
    - (the second is equivalent to `-s -h -o -r -t`)
- Aliases (e.g. `--force` = `-f`)
- Auto generated `--help` (`-h`) page
- Auto generated `--version` (`-v`)
- Powerful argument value handling
    - Supports strings, booleans and numbers
    - Auto-allows `no-` prefixes (e.g. `--no-keep`) to boolean arguments
    - Multi value argument `--find foo bar --baz` (`find = [ 'foo', 'bar' ]`)
    - Typesafe validators
    - Specific values, individually documented in `--help`
- Understands *dash-dash* separation (`--`)
- Smart defaults (what appears as default in `--help` can be dynamic at run-time)


# Usage

```ts
import { arpa } from 'arpa'

const result =
    arpa( {
        name: 'myapp',
        version: '1.2.3',
    } )
    .add( {
        name: 'file',
        alias: 'f',
        type: 'string',
        description: 'The file to write to',
    } )
    .add( {
        name: 'retry',
        alias: 'r',
        type: 'number',
        description: 'Retry <retry> times before bailing',
    } )
    .add( {
        name: 'force',
        type: 'boolean',
        default: true,
        description: 'Force writing to the file',
    } )
    // Defaults to process.argv if no array is provided:
    .parse( [ '-f', 'test.json', '--no-force', 'foo' ] );

expectDeepEqual( result, {
    args: {
        file: 'test.json',
        force: false,
    },
    unknown: [ ],
    rest: [ 'foo' ],
    dashdash: [ ],
} );

// If using TypeScript, the following will not compile since
// <force> is a boolean (even at compile-time):
result.args.force.toLowerCase( ); // !
```

`--help` will write:

```
   Usage: myapp [options]

   Options:

      -h, --help            Print (this) help screen
      -v, --version         Print the program version
      -f, --file <file>     The file to write to
      -r, --retry <retry>   Retry <retry> times before bailing
      --(no-)force          Force writing to the file (default: true)
```


# API

## Settings

The `arpa( )` function creates an object on which arguments can be configured. It can then be used to parse an array of strings, and also to print a help screen.

The options to the `arpa( )` function are:

```ts
{
    name: string;
    version: string;
    description: Description;
    noHelp: boolean;
    allowUnknown: boolean;
    throwOnError: boolean;
    noExit: boolean;
}
```

`name`, `version` and `description` are used for the auto-generated `--help` and `--version` options.
If `noHelp` is true, a `--help` will not be auto-generated.
`allowUnknown` will cause arpa not to fail on unknown arguments, but simply keep them as booleans (in its own array of `{ name, value }` objects called `unknown`).
`throwOnError` will, instead of printing a help screen on invalid arguments, throw an error so that you can control the flow (sometimes useful in unit tests).
`noExit` causes the program not to exit after having printed the help screen or version (sometimes useful in unit tests).


## Arguments

The result of `arpa( )` is an object on which you can add arguments using `add` which takes the following options:

```ts
    arpa( )
    .add( {
        // These are required:
        name: 'force',   // The long-versioned name
        type: 'boolean', // 'string', 'boolean' or 'number'

        // These are optional
        alias: 'f',        // An alias (or array of aliases)
        multi: false,      // Whether this is a multi-valued argument,
                           // only applicable to 'string' and 'number'.
        description: [     // A string or array of strings
            'Force action',
            'Will overwrite foo if bar'
        ],
        negatable: false,  // Adds 'no-' alternative (only applicable
                           // to boolean and true by default)
    } )
    .add( {
        name: 'file',
        type: 'string',

        // More optional, mostly for 'string' and 'number' arguments
        default: 'out.json', // The default-value (printed to --help)
        realDefault:         // The run-time default, unless <default>
            path.join( __dirname, 'out.json' ),
        values: [            // A list of valid values, other will
                             // fail. Will be printed to --help too.
            { 'file': 'Filename of the file to write to' },
            { '-': 'Write to stdout' }
        ],
        example: [           // A list of example arguments
            { '-f my-file.json': 'Write to my-file.json' },
            { '-f -': 'Write to stdout' },
        ],
        match: ( file ) =>   // Custom validation. Overwrites <values>
            file === '-' || file.endsWith( '.json' ),
    } )
```

These will cause the following `--help` output:

```
   Usage: [options]

   Options:

      -h, --help      Print (this) help screen
      -f, --force     Force action
                      Will overwrite foo if bar
      --file <file>    (default: out.json)

                      Values:
                         file   Filename of the file to write to
                         -      Write to stdout

                      Example:
                         -f my-file.json   Write to my-file.json
                         -f -              Write to stdout
```


# Sub-commands

For sub-commands (e.g. like `git`), arpa is designed not to support this as a single-step parsing solution. Instead, you're encouraged to run arpa again. Arpa saves no global state, everything is local to an `arpa( )` context.

```ts
    const mainResult =
        arpa( )
        .add( /* ... */ )
        .add( /* ... */ )
        .parse( ); // Will parse process.argv

    // Applies to the entire application, e.g. verbosity, debug
    const globalOptions = mainResult.args;
    const subCommands = mainResult.rest;

    switch ( subCommands ) // The first non-option argument
    {
        case 'init': return runInit( );
        case 'push': return runPush( );
    }

    // ...

    function runInit( )
    {
        // Parse <init> arguments:
        const initOptions = arpa( )
            .add( /* ... */ )
            .add( /* ... */ )
            .parse( subCommands );

        // ...
    }

    function runPush( )
    {
        // ...
    }
```


[npm-image]: https://img.shields.io/npm/v/arpa.svg
[npm-url]: https://npmjs.org/package/arpa
[travis-image]: https://img.shields.io/travis/grantila/arpa.svg
[travis-url]: https://travis-ci.org/grantila/arpa
[coverage-image]: https://coveralls.io/repos/github/grantila/arpa/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/arpa?branch=master
