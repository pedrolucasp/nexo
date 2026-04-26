export default {
  extensions: {
    ts: 'commonjs'
  },
  nodeArguments: [
    '--require=tsx/cjs',
    '--require=tsconfig-paths/register'
  ],
  files: [
    'tests/**/*.test.ts'
  ],
  environmentVariables: {
    NODE_ENV: 'test',
    TS_NODE_PROJECT: './tsconfig.json'
  },
  timeout: '30s',
  concurrency: 1, // Run tests serially to avoid database conflicts
  verbose: true
};