// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {get} from '@loopback/openapi-v2';

export class NestedController {
  @get('/nested')
  nested() {
    return 'NesterController.nester()';
  }
}