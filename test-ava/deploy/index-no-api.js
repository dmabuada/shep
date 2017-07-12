import test from 'ava'
import td from '../helpers/testdouble'

const functions = '*'
const uploadedFuncs = ['foo', 'bar']
const env = 'beta'
const bucket = 's3_bucket'

const build = td.replace('../../src/util/build-functions')
td.when(build(), { ignoreExtraArgs: true }).thenResolve()
const apiGateway = td.replace('../../src/util/aws/api-gateway')
td.when(apiGateway.deploy(), { ignoreExtraArgs: true }).thenResolve()
const lambda = td.replace('../../src/util/aws/lambda')
td.when(lambda.publishFunction(), { ignoreExtraArgs: true }).thenResolve({})
const setPermissions = td.replace('../../src/util/set-permissions')
td.when(setPermissions(), { ignoreExtraArgs: true }).thenResolve()
const push = td.replace('../../src/util/push-api')
td.when(push(), { ignoreExtraArgs: true }).thenResolve()

const load = td.replace('../../src/util/load')
td.when(load.api()).thenResolve()
td.when(load.funcs(functions)).thenResolve(uploadedFuncs)
td.when(load.lambdaConfig(td.matchers.isA(String))).thenResolve({})

const uploadBuilds = td.replace('../../src/util/upload-builds')
td.when(uploadBuilds(functions, bucket)).thenResolve(uploadedFuncs)

const upload = td.replace('../../src/util/upload-functions')
td.when(upload(uploadedFuncs, env)).thenResolve(uploadedFuncs)

test.before(() => {
  const shep = require('../../src/index')
  return shep.deploy({ env, functions, bucket })
})

test('Builds functions', () => {
  td.verify(build(functions, env))
})

test('Does not deploy API', () => {
  td.verify(apiGateway.deploy(), { times: 0, ignoreExtraArgs: true })
})

test('Does not push API defenitin', () => {
  td.verify(push(), { times: 0, ignoreExtraArgs: true })
})

test('Does promote function aliases', () => {
  td.verify(lambda.publishFunction(td.matchers.isA(Object), env), { times: uploadedFuncs.length })
})

test('Does not setup function permissions', () => {
  td.verify(setPermissions(), { times: 0, ignoreExtraArgs: true })
})