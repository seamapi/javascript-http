import { todo } from '@seamapi/http'
import test from 'ava'

test('todo: returns argument', (t) => {
  t.is(todo('todo'), 'todo', 'returns input')
})
