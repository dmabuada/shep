import test from 'ava'
import td from '../helpers/testdouble'

const lambda = td.replace('../../src/util/aws/lambda')

const load = require('../../src/util/load')

test.before(() => process.chdir('./test/fixtures'))

test('Loads environments', async (t) => {
  const fooAliases = [
    { Name: 'beta' }
  ]

  const aliases = [
    { Name: 'beta' },
    { Name: 'development' }
  ]
  td.when(lambda.listAliases('foo')).thenResolve(aliases, fooAliases)
  td.when(lambda.listAliases('bar')).thenResolve(aliases)

  const envs = await load.envs()

  t.deepEqual(envs, ['beta', 'development'])
  t.throws(load.envs())
})

test('Loads functions', async (t) => {
  const funcs = await load.funcs()
  t.deepEqual(funcs.sort(), [ 'bar', 'foo' ])
})

test('Loads functions by pattern', async (t) => {
  const funcs = await load.funcs('f*')
  t.deepEqual(funcs, [ 'foo' ])
})

test('Loads function events', (t) => {
  t.deepEqual(load.events('foo').sort(), [ 'custom.json', 'default.json' ])
})

test('Loads lambda config', (t) => {
  const config = load.lambdaConfig('foo')
  t.is(config.FunctionName, 'foo')
  t.is(config.Role, 'admin')
  t.is(config.Memory, 5)
})

test('Is ok with no api config', (t) => {
  const config = load.api()
  t.is(config, null)
})
