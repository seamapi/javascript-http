import test from 'ava'

import { todo } from '@seamapi/http'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
