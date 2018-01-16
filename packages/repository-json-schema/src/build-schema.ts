// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {includes} from 'lodash';
import {Definition} from 'typescript-json-schema';

export const JSON_SCHEMA_KEY = 'loopback:json-schema';

/**
 * Type definition for JSON Schema
 */
export interface JsonDefinition extends Definition {
  properties?: {[property: string]: JsonDefinition};
}

// Spoofing of PropertyDefinition and ModelDefinition in @loopback/repository to
// prevent circular dependency
export type PropertyDefinition = {
  type: Function | {};
  [name: string]: {};
};
export type ModelDefinition = {
  properties: {[name: string]: PropertyDefinition};
  [name: string]: {};
};

// NOTE(shimks) no metadata for: union, optional, nested array, any, enum,
// string literal, anonymous types, and inherited properties

/**
 * Converts a LoopBack model class metadata into a JSON Schema using
 * TypeScript's reflection API
 * @param ctor Constructor of class to convert from
 */
export function modelMetaToJsonDef(meta: ModelDefinition): JsonDefinition {
  const schema: JsonDefinition = {};

  for (const p in meta.properties) {
    const propMeta = meta.properties[p];
    if (propMeta.type) {
      if (!schema.properties) {
        schema.properties = {};
      }
      schema.properties[p] = toJsonProperty(propMeta);
    }
  }
  return schema;
}

/**
 * Converts a property in metadata form to a JSON schema property definition
 * @param propMeta Property in metadata to convert from
 */
export function toJsonProperty(propMeta: PropertyDefinition): JsonDefinition {
  const ctor = propMeta.type as Function;

  // errors out if @property.array() is not used on a property of array
  if (ctor === Array) {
    throw new Error('type is defined as an array');
  }

  let prop: JsonDefinition = {};

  if (propMeta.array === true) {
    prop.type = 'array';
    prop.items = toJsonProperty({
      array: ctor === Array ? true : false,
      type: ctor,
    });
  } else if (includes([String, Number, Boolean, Object], ctor)) {
    prop.type = ctor.name.toLowerCase();
  } else {
    prop.$ref = `#definitions/${ctor.name}`;
  }
  return prop;
}
