"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const _1 = require("../../");
describe('basics', () => {
    it('should work handle empty list of arguments', () => {
        const result = _1.arpa().parse([]);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal([]);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
    it('should handle rest on empty arguments', () => {
        const result = _1.arpa().parse(['foo']);
        chai_1.expect(result.args).to.deep.equal({});
        chai_1.expect(result.rest).to.deep.equal(['foo']);
        chai_1.expect(result.unknown).to.deep.equal([]);
        chai_1.expect(result.dashdash).to.deep.equal([]);
    });
});
describe('boolean', () => {
    it('should handle single unused boolean argument', () => {
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
});
describe('string', () => {
    it('should handle single unused string argument', () => {
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const parse = () => _1.arpa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '']);
        chai_1.expect(parse).to.throw();
    });
    it('should fail on single non-numeric argument', () => {
        const parse = () => _1.arpa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', 'x']);
        chai_1.expect(parse).to.throw();
    });
    it('should handle single used number argument (overriding default)', () => {
        const result = _1.arpa()
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
        const result = _1.arpa()
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
        const oldLog = console.log;
        const lines = [];
        console.log = (...args) => lines.push(args.join(' '));
        _1.arpa().showHelp();
        console.log = oldLog;
        const helpLine = lines.filter(line => /-h, --help/.test(line));
        chai_1.expect(helpLine.length).to.equal(1);
        chai_1.expect(helpLine[0]).to.contain("help");
    });
    it('should not print --version unless version is provided', () => {
        const oldLog = console.log;
        const lines = [];
        console.log = (...args) => lines.push(args.join(' '));
        _1.arpa().showHelp();
        console.log = oldLog;
        const verLine = lines.filter(line => /-v, --version/.test(line));
        chai_1.expect(verLine.length).to.equal(0);
    });
    it('should print --version if provided', () => {
        const oldLog = console.log;
        const lines = [];
        console.log = (...args) => lines.push(args.join(' '));
        _1.arpa({ version: '0.0.1' }).showHelp();
        console.log = oldLog;
        const verLine = lines.filter(line => /-v, --version/.test(line));
        chai_1.expect(verLine.length).to.equal(1);
        chai_1.expect(verLine[0]).to.contain("version");
    });
});
describe('version', () => {
    it('should print version on -v', () => {
        const oldLog = console.log;
        const lines = [];
        console.log = (...args) => lines.push(args.join(' '));
        _1.arpa({ version: '1.2.3', noExit: true }).parse(['-v']);
        console.log = oldLog;
        chai_1.expect(lines).to.deep.equal(['1.2.3']);
    });
    it('should print version and program name on -v', () => {
        const oldLog = console.log;
        const lines = [];
        console.log = (...args) => lines.push(args.join(' '));
        _1.arpa({ version: '1.2.3', name: 'foo', noExit: true })
            .parse(['-v']);
        console.log = oldLog;
        chai_1.expect(lines).to.deep.equal(['foo 1.2.3']);
    });
});
describe('unknown', () => {
    it('should not allow unknown arguments', () => {
        const parser = () => _1.arpa({ throwOnError: true })
            .add({
            name: 'foo',
            type: 'number',
            alias: 'f',
        })
            .parse(['-f', '0', '-g']);
        chai_1.expect(parser).to.throw('Unknown');
    });
    it('should allow simple unknown arguments', () => {
        const result = _1.arpa({ allowUnknown: true })
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
        const result = _1.arpa({ allowUnknown: true })
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
// TODO: Test multi
//       Test description
//       Test values
//       Test examples
//       Test match
//       Test negatable
//       Test realDefault
//# sourceMappingURL=index.js.map