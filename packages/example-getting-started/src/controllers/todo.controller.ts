// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-getting-started
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Filter, Where} from '@loopback/repository';
import {post, param, get, put, patch, del} from '@loopback/openapi-v2';
import {inject} from '@loopback/context';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';

export class TodoController {
  constructor(
    @inject('repositories.TodoRepository')
    public todoRepository: TodoRepository,
  ) {}

  @post('/todo')
  async create(@param.body('obj') obj: Todo): Promise<Todo> {
    return await this.todoRepository.create(obj);
  }

  @get('/todo/count')
  async count(@param.query.string('where') where: Where): Promise<number> {
    return await this.todoRepository.count(where);
  }

  @get('/todo')
  async find(@param.query.string('filter') filter: Filter): Promise<Todo[]> {
    return await this.todoRepository.find(filter);
  }

  @patch('/todo')
  async updateAll(
    @param.query.string('where') where: Where,
    @param.body('obj') obj: Todo,
  ): Promise<number> {
    return await this.todoRepository.updateAll(where, obj);
  }

  @del('/todo')
  async deleteAll(@param.query.string('where') where: Where): Promise<number> {
    return await this.todoRepository.deleteAll(where);
  }

  @get('/todo/{id}')
  async findById(@param.path.number('id') id: number): Promise<Todo> {
    return await this.todoRepository.findById(id);
  }

  @patch('/todo/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @param.body('obj') obj: Todo,
  ): Promise<boolean> {
    return await this.todoRepository.updateById(id, obj);
  }

  @del('/todo/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<boolean> {
    return await this.todoRepository.deleteById(id);
  }
}
