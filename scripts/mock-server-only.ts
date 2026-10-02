/**
 * Mock module untuk server-only pada standalone CLI test runner
 */
import Module from 'module';

const originalRequire = Module.prototype.require;
// @ts-ignore
Module.prototype.require = function (path: string) {
  if (path === 'server-only') {
    return {};
  }
  // @ts-ignore
  return originalRequire.apply(this, arguments);
};
