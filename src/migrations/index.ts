import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20260811_104401_add_form_builder from './20260811_104401_add_form_builder'
import * as migration_20261016_171341_pages_schema from './20261016_171341_pages_schema'
import * as migration_20261019_234056_current_schema from './20261019_234056_current_schema'

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
  {
    up: migration_20261016_171341_pages_schema.up,
    down: migration_20261016_171341_pages_schema.down,
    name: '20261016_171341_pages_schema',
  },
  {
    up: migration_20261019_234056_current_schema.up,
    down: migration_20261019_234056_current_schema.down,
    name: '20261019_234056_current_schema',
  },
]
