// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * This module contains types for values and/or promises as well as a set of
 * utility methods to handle values and/or promises.
 */

// tslint:disable-next-line:no-any
export type BoundValue = any;

/**
 * Representing a value or promise. This type is used to represent results of
 * synchronous/asynchronous resolution of values.
 */
export type ValueOrPromise<T> = T | Promise<T>;

export type MapObject<T> = {[name: string]: T};

/**
 * Check whether a value is a Promise-like instance.
 * Recognizes both native promises and third-party promise libraries.
 *
 * @param value The value to check.
 */
export function isPromise<T>(
  value: T | PromiseLike<T>,
): value is PromiseLike<T> {
  if (!value) return false;
  if (typeof value !== 'object' && typeof value !== 'function') return false;
  return typeof (value as PromiseLike<T>).then === 'function';
}

/**
 * Get nested properties by path
 * @param value Value of an object
 * @param path Path to the property
 */
export function getDeepProperty(value: BoundValue, path: string) {
  const props = path.split('.').filter(Boolean);
  for (const p of props) {
    if (value == null) {
      return value;
    }
    value = value[p];
  }
  return value;
}

/**
 * Resolve entries of an object into a new object with the same keys or a
 * promise of the new object. Please note some of the entries can be resolved
 * synchronously while others need to be resolved asynchronously.
 * @param map The original object containing the source entries
 * @param resolver A function resolves an entry to a value or promise. It will
 * be invoked with the property value, the property name, and the source object.
 */
export function resolveMap<T, V>(
  map: MapObject<T>,
  resolver: (v: T, p: string, map: MapObject<T>) => ValueOrPromise<V>,
): ValueOrPromise<MapObject<V>> {
  const result: MapObject<V> = {};
  let asyncResolvers: PromiseLike<void>[] | undefined = undefined;

  const setter = (p: string) => (v: V) => {
    result[p] = v;
  };

  for (const p in map) {
    const valueOrPromise = resolver(map[p], p, map);
    if (isPromise(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(valueOrPromise.then(setter(p)));
    } else {
      result[p] = valueOrPromise;
    }
  }

  if (asyncResolvers) {
    return Promise.all(asyncResolvers).then(() => result);
  } else {
    return result;
  }
}

/**
 * Resolve entries of an array into a new array with the same indexes or a
 * promise of the new object. Please note some of the entries can be resolved
 * synchronously while others need to be resolved asynchronously.
 * @param list The original array containing the source entries
 * @param resolver A function resolves an entry to a value or promise. It will
 * be invoked with the property value, the property index, and the source array.
 */
export function resolveList<T, V>(
  list: T[],
  resolver: (v: T, i: number, list: T[]) => ValueOrPromise<V>,
): ValueOrPromise<V[]> {
  const result: V[] = new Array<V>(list.length);
  let asyncResolvers: PromiseLike<void>[] | undefined = undefined;

  const setter = (i: number) => (v: V) => {
    result[i] = v;
  };

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < list.length; i++) {
    const valueOrPromise = resolver(list[i], i, list);
    if (isPromise(valueOrPromise)) {
      if (!asyncResolvers) asyncResolvers = [];
      asyncResolvers.push(valueOrPromise.then(setter(i)));
    } else {
      result[i] = valueOrPromise;
    }
  }

  if (asyncResolvers) {
    return Promise.all(asyncResolvers).then(() => result);
  } else {
    return result;
  }
}

/**
 * Try to run an action that returns a promise or a value
 * @param action A function that returns a promise or a value
 * @param finalAction A function to be called once the action
 * is fulfilled or rejected (synchronously or asynchronously)
 */
export function tryWithFinally<T>(
  action: () => ValueOrPromise<T>,
  finalAction: () => void,
): ValueOrPromise<T> {
  let result: ValueOrPromise<T>;
  try {
    result = action();
  } catch (err) {
    finalAction();
    throw err;
  }
  if (isPromise(result)) {
    // Once (promise.finally)[https://github.com/tc39/proposal-promise-finally
    // is supported, the following can be simplifed as
    // `result = result.finally(finalAction);`
    result = result.then(
      val => {
        finalAction();
        return val;
      },
      err => {
        finalAction();
        throw err;
      },
    );
  } else {
    finalAction();
  }
  return result;
}
