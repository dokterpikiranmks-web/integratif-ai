// Mock 'server-only' so test runners can import server files
try {
  require.cache[require.resolve('server-only')] = {
    id: require.resolve('server-only'),
    filename: require.resolve('server-only'),
    loaded: true,
    exports: {},
  };
} catch (_) {}

const jiti = require('jiti')(__filename, {
  interopDefault: true,
  extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json'],
  alias: {
    '@': require('path').resolve(__dirname, '..'),
    'server-only': require('path').resolve(__dirname, 'mock-server-only.ts')
  }
});

const scriptToRun = process.argv[2];
if (!scriptToRun) {
  console.error('Specify a script to run');
  process.exit(1);
}

jiti(require('path').resolve(process.cwd(), scriptToRun));
