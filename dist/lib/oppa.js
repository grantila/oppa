'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    name: null,
    version: null,
    description: null,
    noHelp: false,
    allowUnknown: false,
    throwOnError: false,
    noExit: false,
};
function parseArg(text) {
    const pos = text.indexOf('=');
    if (pos === -1)
        return { name: text };
    return {
        name: text.substr(0, pos),
        value: text.substr(pos + 1),
    };
}
;
function parseValue(value, argument, raw) {
    if (argument.type === 'number') {
        const num = Number(value);
        if (('' + num) !== value)
            throw new Error("Invalid numeric value: " + value);
        return num;
    }
    if (argument.type === 'boolean') {
        throw new Error("Invalid usage of boolean argument: " + raw);
    }
    return value;
}
;
function validate(value, raw, argument) {
    if (!argument.match)
        return;
    const result = (typeof argument.match === 'function')
        ? argument.match(value, raw, argument)
        : argument.match.test(raw);
    if (!result)
        throw new Error(`Invalid argument for ${argument.name}: ${value}`);
}
function arrayify(value) {
    if (value == null)
        return [];
    else if (Array.isArray(value))
        return [...value];
    else
        return [value];
}
function flattenTable(table) {
    const rows = !table
        ? []
        : !Array.isArray(table)
            ? [table]
            : table;
    return [].concat(...rows
        .map(obj => Object.keys(obj)
        .map(key => ({ key, desc: arrayify(obj[key]) }))));
}
class Oppa {
    constructor(opts) {
        this.arguments = [];
        this.byLongs = new Map();
        this.byShorts = new Map();
        this.opts = opts;
        this.add({
            name: 'help',
            type: 'boolean',
            alias: 'h',
            description: 'Print (this) help screen',
            negatable: false,
            match: () => {
                this.showHelp(true);
                return true;
            },
        });
        if (this.opts.version)
            this.add({
                name: 'version',
                type: 'boolean',
                alias: 'v',
                description: 'Print the program version',
                negatable: false,
                match: () => {
                    this.showVersion(true);
                    return true;
                },
            });
    }
    add(_argument) {
        const argument = { ..._argument };
        const alias = !argument.alias
            ? []
            : Array.isArray(argument.alias)
                ? argument.alias
                : [argument.alias];
        const names = [argument.name, ...alias];
        const shorts = names.filter(name => name.length === 1);
        const longs = names.filter(name => name.length > 1);
        argument.negatable =
            argument.type !== 'boolean'
                ? false
                : 'negatable' in argument
                    ? argument.negatable
                    : true;
        this.arguments.push(argument);
        shorts.forEach(short => {
            if (this.byShorts.has(short))
                throw new Error(`name alias '${short}' already added`);
            this.byShorts.set(short, argument);
        });
        longs.forEach(long => {
            if (this.byLongs.has(long))
                throw new Error(`name alias '${long}' already added`);
            this.byLongs.set(long, argument);
            if (argument.type === 'boolean' && argument.negatable !== false) {
                if (this.byLongs.has('no-' + long))
                    throw new Error(`name alias 'no-${long}' already added`);
                this.byLongs.set('no-' + long, argument);
            }
        });
        // Best cast ever
        return this;
    }
    _parse(_args) {
        const dashdashPos = _args.indexOf('--');
        const dashdash = dashdashPos === -1 ? [] : _args.slice(dashdashPos);
        _args =
            dashdashPos === -1
                ? [..._args]
                : _args.slice(0, dashdashPos);
        const args = {};
        const unknown = [];
        const rest = [];
        const setValue = (argument, value) => {
            if (argument.multi) {
                if (!args[argument.name])
                    args[argument.name] = [value];
                else
                    args[argument.name].push(value);
            }
            else
                args[argument.name] = value;
        };
        const handleArgument = (raw, name, value, long, squeezed) => {
            if (name.length > 1 && !long) {
                // Merged shortcuts, take care of all up until last (treat as
                // booleans)
                while (name.length > 1) {
                    const short = name.charAt(0);
                    name = name.substr(1);
                    handleArgument('-' + short, short, null, false, true);
                }
            }
            const argument = long
                ? this.byLongs.get(name)
                : this.byShorts.get(name);
            if (!argument) {
                if (this.opts.allowUnknown) {
                    unknown.push({ name, value });
                    return;
                }
                else
                    throw new Error("Unknown argument: " + raw);
            }
            if (value != null) {
                const typedValue = parseValue(value, argument, raw);
                validate(typedValue, value, argument);
                setValue(argument, typedValue);
                return;
            }
            if (argument.type === 'boolean') {
                // TODO: Change this logic to work with long aliases
                const negated = name === ('no-' + argument.name);
                validate(!negated, value, argument);
                setValue(argument, !negated);
                return;
            }
            // Argument value is the next (and potentially subsequent)
            // arguments
            return argument;
        };
        for (let i = 0; i < _args.length; ++i) {
            const arg = _args[i];
            if (arg.charAt(0) !== '-') {
                rest.push(..._args.slice(i));
                break;
            }
            const long = arg.charAt(1) === '-';
            const { name, value } = parseArg(arg.substr(long ? 2 : 1));
            if (name.indexOf('-') !== -1 && !long)
                throw new Error("Invalid argument: " + arg);
            const argument = handleArgument(arg, name, value, long, false);
            if (argument) {
                const setNextValue = (value) => {
                    const typedValue = parseValue(value, argument, value);
                    validate(typedValue, value, argument);
                    setValue(argument, typedValue);
                };
                if (!argument.multi) {
                    // Next argument is the value of this argument
                    ++i;
                    if (_args.length === i)
                        throw new Error("Missing value for argument " + arg);
                    setNextValue(_args[i]);
                }
                else {
                    // Use values up until an argument begins with '-'
                    // TODO: Reconsider. Maybe allow values that begin with '-'
                    //       but aren't arguments. Maybe implement a list of
                    //       sub-commands that can be detected.
                    for (++i; i < _args.length; ++i) {
                        const value = _args[i];
                        if (value.startsWith('-')) {
                            --i;
                            break;
                        }
                        setNextValue(value);
                    }
                }
            }
        }
        this.arguments
            .filter(argument => ('default' in argument) || ('realDefault' in argument))
            .forEach(argument => {
            const theDefault = 'realDefault' in argument
                ? argument.realDefault
                : argument.default;
            if (!(argument.name in args))
                args[argument.name] = theDefault;
        });
        return { args, unknown, rest, dashdash };
    }
    parse(args) {
        if (!args) {
            args = process.argv.slice(2);
            if (!this.opts.name) {
                const reProgramName = /.*\/(.+)(\.[tj]s)?$/;
                const m = ("/" + process.argv[1]).match(reProgramName);
                this.opts.name = m[1] || null;
            }
        }
        try {
            return this._parse(args);
        }
        catch (err) {
            if (this.opts.throwOnError)
                throw err;
            console.error(err.message);
            this.showHelp(true);
        }
    }
    showVersion(exit = false) {
        const prefix = this.opts.name ? this.opts.name + " " : "";
        console.log(prefix + this.opts.version);
        if (exit && !this.opts.noExit)
            process.exit(0);
    }
    showHelp(exit = false) {
        const line = (...texts) => console.log("  ", ...texts);
        const name = this.opts.name ? (this.opts.name + " ") : "";
        line();
        line("Usage: " + name + "[options]");
        line();
        if (this.opts.description) {
            const lines = Array.isArray(this.opts.description)
                ? this.opts.description
                : [this.opts.description];
            lines.forEach(l => line(l));
            line();
        }
        const shortFirst = (list) => {
            const short = list.filter(text => text.length === 1);
            const long = list.filter(text => text.length > 1);
            return [...short, ...long];
        };
        const dashify = (text, argument) => text.length === 1
            ? `-${text}`
            : argument.negatable
                ? `--(no-)${text}`
                : `--${text}`;
        const widenLeft = (text, width) => ' '.repeat(width - text.length) + text;
        const widenRight = (text, width) => text + ' '.repeat(width - text.length);
        const valueify = (argument) => argument.type === 'boolean'
            ? ''
            : argument.multi
                ? ` <${argument.name}...>`
                : ` <${argument.name}>`;
        const printTable = (indent, rows) => {
            const width = rows
                .map(row => row.key.length)
                .sort((a, b) => b - a)[0];
            const prefix = " ".repeat(indent);
            rows.forEach(({ key, desc, handler }) => {
                const [first, ...rest] = desc;
                line(prefix +
                    widenRight(key, width) +
                    "   " +
                    first);
                rest.forEach(text => line(prefix +
                    widenRight('', width) +
                    "   " +
                    text));
                handler && handler(indent + width);
            });
        };
        const args = this.arguments.map(argument => {
            const name = shortFirst([argument.name, ...arrayify(argument.alias)])
                .map(name => dashify(name, argument))
                .join(', ')
                + valueify(argument);
            return { name, argument };
        });
        if (args.length) {
            line("Options:");
            line();
        }
        const rows = args
            .map(({ name, argument }) => {
            const description = !argument.description
                ? ['']
                : arrayify(argument.description);
            const defaultValue = 'default' in argument
                ? ` (default: ${argument.default})`
                : '';
            const [first, ...rest] = description;
            const firstDescription = rest.length > 0
                ? first
                : (first + defaultValue);
            if (rest.length > 0 && defaultValue)
                rest.push(defaultValue);
            const handler = (width) => {
                const prefix = " ".repeat(width);
                const values = flattenTable(argument.values);
                if (values.length > 0) {
                    line();
                    line(prefix + "   Values:");
                    printTable(width + 6, values);
                }
                const examples = flattenTable(argument.example);
                if (examples.length > 0) {
                    line();
                    line(prefix + "   Example:");
                    printTable(width + 6, examples);
                }
                if (values.length > 0 || examples.length > 0)
                    line();
            };
            return {
                key: name,
                desc: [firstDescription, ...rest],
                handler,
            };
        });
        printTable(3, rows);
        line();
        if (exit && !this.opts.noExit)
            process.exit(0);
    }
}
exports.Oppa = Oppa;
function oppa(opts) {
    return new Oppa(Object.assign({}, defaultOptions, opts));
}
exports.oppa = oppa;
//# sourceMappingURL=oppa.js.map