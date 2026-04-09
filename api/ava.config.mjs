export default {
  "typescript": {
    "extensions": [
      "ts",
      "tsx"
    ],
    "rewritePaths": {
      "src/": "dist/"
    },
    compile: false
  },
 // extensions: {
 //   ts: 'module'
 // },
 // nodeArguments: [
 //   '--import=tsx'
 // ],
  files: [
    'tests/**/*.test.ts'
  ],
  environmentVariables: {
    NODE_ENV: 'test'
  },
  timeout: '30s',
  concurrency: 1, // Run tests serially to avoid database conflicts
  verbose: true
};
