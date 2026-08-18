import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20260811_104401_add_form_builder from './20260811_104401_add_form_builder'

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260811_104401_add_form_builder.up,
    down: migration_20260811_104401_add_form_builder.down,
    name: '20260811_104401_add_form_builder',
  },
]
