/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @preventMunge
 * @flow strict
 */

'use strict';

/**
 * Checks whether a collection name (e.g. "Map" or "Set") has a native polyfill
 * that is safe to be used.
 */
function _shouldActuallyPolyfillES6Collection(collectionName: string): boolean {
  const Collection = global[collectionName];
  if (Collection == null) {
    return true;
  }

  // The iterator protocol depends on `Symbol.iterator`. If a collection is
  // implemented, but `Symbol` is not, it's going to break iteration because
  // we'll be using custom "@@iterator" instead, which is not implemented on
  // native collections.
  if (typeof global.Symbol !== 'function') {
    return true;
  }

  const proto = Collection.prototype;

  // These checks are adapted from es6-shim: https://fburl.com/34437854
  // NOTE: `isCallableWithoutNew` and `!supportsSubclassing` are not checked
  // because they make debugging with "break on exceptions" difficult.
  return (
    Collection == null ||
    typeof Collection !== 'function' ||
    typeof proto.clear !== 'function' ||
    new Collection().size !== 0 ||
    typeof proto.keys !== 'function' ||
    typeof proto.forEach !== 'function'
  );
}

const cache: {[name: string]: boolean} = {};

/**
 * Checks whether a collection name (e.g. "Map" or "Set") has a native polyfill
 * that is safe to be used and caches this result.
 * Make sure to make a first call to this function before a corresponding
 * property on global was overriden in any way.
 */
function _shouldPolyfillES6Collection(collectionName: string) {
  let result = cache[collectionName];
  if (result !== undefined) {
    return result;
  }

  result = _shouldActuallyPolyfillES6Collection(collectionName);
  cache[collectionName] = result;
  return result;
}

module.exports = _shouldPolyfillES6Collection;
