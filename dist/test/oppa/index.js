"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const _1 = require("../../");
function mockConsoleLog() {
    const oldLog = console.log;
    const lines = [];
    console.log = (...args) => lines.push(args.join(' '));
    return {
        lines,
        cleanup: () => console.log = oldLog,
    };
}
describe('basics', () => {
    it('should work handle empty list of arguments', () => {
        const result = _1.oppa().parse([]);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle rest on empty arguments', () => {
        const result = _1.oppa().parse(['foo']);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal(['foo']);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should throw on already existing (long) name', () => {
        const parser = () => _1.oppa()
            .add({ name: 'foo', type: 'string' })
            .add({ name: 'bar', type: 'string' })
            .add({ name: 'foo', type: 'string' });
        chai_1.expect(parser).to.throw(/'foo'.*already added/);
    });
    it('should throw on conflicting auto-negated long name', () => {
        const parser1 = () => _1.oppa()
            .add({ name: 'foo', type: 'boolean' })
            .add({ name: 'bar', type: 'boolean' })
            .add({ name: 'no-foo', type: 'boolean' });
        chai_1.expect(parser1).to.throw(/fo.*already added/);
        const parser2 = () => _1.oppa()
            .add({ name: 'no-foo', type: 'boolean' })
            .add({ name: 'foo', type: 'boolean' })
            .add({ name: 'bar', type: 'boolean' });
        chai_1.expect(parser2).to.throw(/fo.*already added/);
    });
    it('should throw on already existing (short) name', () => {
        const parser = () => _1.oppa()
            .add({ name: 'foo', type: 'string', alias: 'f' })
            .add({ name: 'bar', type: 'string', alias: 'b' })
            .add({ name: 'baz', type: 'string', alias: 'b' });
        chai_1.expect(parser).to.throw(/'b'.*already added/);
    });
    it('should handle multiple short aliases', () => {
        const result = _1.oppa()
            .add({ name: 'foo', type: 'string', alias: ['f', 'o'] })
            .parse(['-o', 'bar']);
        chai_1.expect(result.args).to.deep.equal({ 'foo': 'bar' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle long alias', () => {
        const result = _1.oppa()
            .add({ name: 'foo', type: 'string', alias: 'bar' })
            .parse(['--bar', 'baz']);
        chai_1.expect(result.args).to.deep.equal({ 'foo': 'baz' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle multiple long aliases', () => {
        const result = _1.oppa()
            .add({ name: 'foo', type: 'string', alias: ['bar', 'baz'] })
            .parse(['--baz', 'bay']);
        chai_1.expect(result.args).to.deep.equal({ 'foo': 'bay' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle mix of short and long aliases', () => {
        const result = _1.oppa()
            .add({ name: 'foo', type: 'string', alias: ['bar', 'f', 'baz'] })
            .parse(['-f', 'bay']);
        chai_1.expect(result.args).to.deep.equal({ 'foo': 'bay' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('boolean', () => {
    it('should handle single unused boolean argument', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single unused boolean argument (default=false)', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
            default: false,
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({ add: false });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single unused boolean argument (default=true)', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
            default: true,
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({ add: true });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single used boolean argument', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
        })
            .parse(['-a']);
        chai_1.expect(result.args).to.deep.equal({ add: true });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single negated boolean argument', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
        })
            .parse(['--no-add']);
        chai_1.expect(result.args).to.deep.equal({ add: false });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single used boolean argument (overriding default)', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
            default: false
        })
            .parse(['-a']);
        chai_1.expect(result.args).to.deep.equal({ add: true });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single negated boolean argument (overriding default)', () => {
        const result = _1.oppa()
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
            default: true
        })
            .parse(['--no-add']);
        chai_1.expect(result.args).to.deep.equal({ add: false });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('shouldn\'t allow value ("=value") for booleans', () => {
        const parser = () => _1.oppa({ throwOnError: true })
            .add({
            name: 'add',
            type: 'boolean',
        })
            .parse(['--add=1']);
        chai_1.expect(parser).to.throw('usage');
    });
    it('shouldn\'t allow value ("=value") for last shortened boolean', () => {
        const parser = () => _1.oppa({ throwOnError: true, allowUnknown: true })
            .add({
            name: 'add',
            type: 'boolean',
            alias: 'a',
        })
            .parse(['-xa=1']);
        chai_1.expect(parser).to.throw('usage');
    });
});
describe('string', () => {
    it('should handle single unused string argument', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single unused string argument (empty default)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
            default: '',
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({ foo: '' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single unused string argument (non-empty default)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
            default: 'bar',
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({ foo: 'bar' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single used string argument', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
        })
            .parse(['-f', 'bar']);
        chai_1.expect(result.args).to.deep.equal({ foo: 'bar' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single empty string argument', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
        })
            .parse(['-f', '']);
        chai_1.expect(result.args).to.deep.equal({ foo: '' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single used string argument (overriding default)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
            default: ''
        })
            .parse(['-f', 'bar']);
        chai_1.expect(result.args).to.deep.equal({ foo: 'bar' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single negated string argument (overriding default)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'string',
            alias: 'f',
            default: 'bar'
        })
            .parse(['-f', '']);
        chai_1.expect(result.args).to.deep.equal({ foo: '' });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('number', () => {
    it('should handle single unused number argument', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single unused number argument (default=0)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            default: 0,
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({ foo: 0 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single unused number argument (default=1)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            default: 1,
        })
            .parse([]);
        chai_1.expect(result.args).to.deep.equal({ foo: 1 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single non-zero number argument', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '1']);
        chai_1.expect(result.args).to.deep.equal({ foo: 1 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single zero number argument', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '0']);
        chai_1.expect(result.args).to.deep.equal({ foo: 0 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should fail on single empty string argument', () => {
        const parse = () => _1.oppa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '']);
        chai_1.expect(parse).to.throw();
    });
    it('should fail on single non-numeric argument', () => {
        const parse = () => _1.oppa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', 'x']);
        chai_1.expect(parse).to.throw("Invalid numeric");
    });
    it('should handle single used number argument (overriding default)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            default: 0,
        })
            .parse(['-f', '1']);
        chai_1.expect(result.args).to.deep.equal({ foo: 1 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle single negated number argument (overriding default)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            default: 1,
        })
            .parse(['-f', '0']);
        chai_1.expect(result.args).to.deep.equal({ foo: 0 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('help', () => {
    it('should print help screen on <showHelp>', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa().showHelp();
        cleanup();
        const helpLine = lines.filter(line => /-h, --help/.test(line));
        chai_1.expect(helpLine.length).to.equal(1);
        chai_1.expect(helpLine[0]).to.contain("help");
    });
    it('should not print --version unless version is provided', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa().showHelp();
        cleanup();
        const verLine = lines.filter(line => /-v, --version/.test(line));
        chai_1.expect(verLine.length).to.equal(0);
    });
    it('should print --version if provided', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa({ version: '0.0.1' }).showHelp();
        cleanup();
        const verLine = lines.filter(line => /-v, --version/.test(line));
        chai_1.expect(verLine.length).to.equal(1);
        chai_1.expect(verLine[0]).to.contain("version");
    });
    it('should print --version if provided', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa({ noExit: true, version: '0.0.1' }).parse(['-v']);
        cleanup();
        chai_1.expect(lines).to.deep.equal(['0.0.1']);
    });
    it('should print --help if provided', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa({ noExit: true }).parse(['-h']);
        cleanup();
        chai_1.expect(lines.filter(line => /Usage:/.test(line)).length)
            .to.equal(1);
    });
    it('should print custom usage if provided', () => {
        const { lines, cleanup } = mockConsoleLog();
        const usage = "foo bar";
        _1.oppa({ usage }).showHelp();
        cleanup();
        const helpLine = lines.filter(line => /Usage: foo bar/.test(line));
        chai_1.expect(helpLine.length).to.equal(1);
    });
});
describe('version', () => {
    it('should print version on -v', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa({ version: '1.2.3', noExit: true }).parse(['-v']);
        cleanup();
        chai_1.expect(lines).to.deep.equal(['1.2.3']);
    });
    it('should print version and program name on -v', () => {
        const { lines, cleanup } = mockConsoleLog();
        _1.oppa({ version: '1.2.3', name: 'foo', noExit: true })
            .parse(['-v']);
        cleanup();
        chai_1.expect(lines).to.deep.equal(['foo 1.2.3']);
    });
});
describe('unknown', () => {
    it('should not allow unknown arguments', () => {
        const parser = () => _1.oppa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '0', '-g']);
        chai_1.expect(parser).to.throw('Unknown');
    });
    it('should allow simple unknown arguments', () => {
        const result = _1.oppa({ allowUnknown: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '0', '-g']);
        chai_1.expect(result.args).to.deep.equal({ foo: 0 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([
            { name: 'g', value: undefined }
        ]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should allow valued unknown arguments', () => {
        const result = _1.oppa({ allowUnknown: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '0', '-g=x']);
        chai_1.expect(result.args).to.deep.equal({ foo: 0 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([
            { name: 'g', value: 'x' }
        ]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('negatable', () => {
    it('should use <negatable> by default', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'boolean',
        })
            .parse(['--no-foo']);
        chai_1.expect(result.args).to.deep.equal({ foo: false });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should use <negatable> if explicitly true', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'boolean',
            negatable: true,
        })
            .parse(['--no-foo']);
        chai_1.expect(result.args).to.deep.equal({ foo: false });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('shouldn\'t use <negatable> if explicitly false', () => {
        const result = _1.oppa({ allowUnknown: true })
            .add({
            name: 'foo',
            type: 'boolean',
            negatable: false,
        })
            .parse(['--no-foo']);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown)
            .to.deep.equal([{ name: 'no-foo', value: undefined }]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('realDefault', () => {
    it('should specify default in --help but use realDefault', () => {
        const parser = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            default: 1,
            realDefault: 2,
        });
        const { lines, cleanup } = mockConsoleLog();
        parser.showHelp(false);
        cleanup();
        const result = parser.parse([]);
        const fooLine = lines.filter(line => /foo/.test(line))[0];
        chai_1.expect(fooLine).to.contain("default: 1");
        chai_1.expect(result.args).to.deep.equal({ foo: 2 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('match', () => {
    it('should handle functions (mismatch)', () => {
        const parser = () => _1.oppa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            match: num => num % 2 === 0,
        })
            .parse(['-f', '1']);
        chai_1.expect(parser).to.throw('Invalid argument');
    });
    it('should handle functions (match)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            match: num => num % 2 === 0,
        })
            .parse(['-f', '2']);
        chai_1.expect(result.args).to.deep.equal({ foo: 2 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle regular expressions (mismatch)', () => {
        const parser = () => _1.oppa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            match: /[02468]/,
        })
            .parse(['-f', '1']);
        chai_1.expect(parser).to.throw('Invalid argument');
    });
    it('should handle regular expressions (match)', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            match: /[02468]/,
        })
            .parse(['-f', '2']);
        chai_1.expect(result.args).to.deep.equal({ foo: 2 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('help table', () => {
    it('should properly print value table (if just object)', () => {
        const parser = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            values: {
                'a': 'A',
                'b': 'B',
            }
        });
        const { lines, cleanup } = mockConsoleLog();
        parser.showHelp(false);
        cleanup();
        const numA = lines.filter(line => /a.*A/.test(line)).length;
        const numB = lines.filter(line => /b.*B/.test(line)).length;
        chai_1.expect(numA).to.equal(1);
        chai_1.expect(numB).to.equal(1);
    });
    it('should properly print value table (if array of objects)', () => {
        const parser = _1.oppa()
            .add({
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
        });
        const { lines, cleanup } = mockConsoleLog();
        parser.showHelp(false);
        cleanup();
        const numA = lines.filter(line => /a.*A/.test(line)).length;
        const numB = lines.filter(line => /b.*B/.test(line)).length;
        const numC = lines.filter(line => /c.*C/.test(line)).length;
        chai_1.expect(numA).to.equal(1);
        chai_1.expect(numB).to.equal(1);
        chai_1.expect(numC).to.equal(1);
    });
    it('should properly print example table (if just object)', () => {
        const parser = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
            example: {
                'a': 'A',
                'b': 'B',
            }
        });
        const { lines, cleanup } = mockConsoleLog();
        parser.showHelp(false);
        cleanup();
        const numA = lines.filter(line => /a.*A/.test(line)).length;
        const numB = lines.filter(line => /b.*B/.test(line)).length;
        chai_1.expect(numA).to.equal(1);
        chai_1.expect(numB).to.equal(1);
    });
    it('should properly print example table (if array of objects)', () => {
        const parser = _1.oppa()
            .add({
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
        });
        const { lines, cleanup } = mockConsoleLog();
        parser.showHelp(false);
        cleanup();
        const numA = lines.filter(line => /a.*A/.test(line)).length;
        const numB = lines.filter(line => /b.*B/.test(line)).length;
        const numC = lines.filter(line => /c.*C/.test(line)).length;
        chai_1.expect(numA).to.equal(1);
        chai_1.expect(numB).to.equal(1);
        chai_1.expect(numC).to.equal(1);
    });
});
describe('dash-dash', () => {
    it('should handle only empty dash-dash', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
        })
            .parse(['--']);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal(['--']);
    });
    it('should handle empty dash-dash after arguments', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
        })
            .parse(['--foo', '47', '--']);
        chai_1.expect(result.args).to.deep.equal({ foo: 47 });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal(['--']);
    });
    it('should handle empty dash-dash after rest', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
        })
            .parse(['--foo', '47', 'bar', '--']);
        chai_1.expect(result.args).to.deep.equal({ foo: 47 });
        chai_1.expect(result.rest).to.deep.equal(['bar']);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal(['--']);
    });
    it('should handle data after dash-dash after rest', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
        })
            .parse(['--foo', '47', 'bar', '--', 'baz']);
        chai_1.expect(result.args).to.deep.equal({ foo: 47 });
        chai_1.expect(result.rest).to.deep.equal(['bar']);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal(['--', 'baz']);
    });
});
describe('multi', () => {
    it('should handle multi-args and stop at next arg', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            multi: true,
        })
            .add({
            name: 'bar',
            type: 'boolean',
        })
            .parse(['--foo', '1', '2', '3', '--bar']);
        chai_1.expect(result.args).to.deep.equal({ foo: [1, 2, 3], bar: true });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle multi-args and stop at dash-dash', () => {
        const result = _1.oppa()
            .add({
            name: 'foo',
            type: 'number',
            multi: true,
        })
            .add({
            name: 'bar',
            type: 'boolean',
        })
            .parse(['--foo', '1', '2', '3', '--']);
        chai_1.expect(result.args).to.deep.equal({ foo: [1, 2, 3] });
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal(['--']);
    });
});
// TODO: Test description
//       Test values
//       Test examples
//       Test match
//# sourceMappingURL=index.js.map