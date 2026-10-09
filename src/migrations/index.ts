import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260811_104401_add_form_builder from './20260811_104401_add_form_builder';
import * as migration_20261009_021708_add_pages_and_site_settings from './20261009_021708_add_pages_and_site_settings';

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
    up: migration_20261009_021708_add_pages_and_site_settings.up,
    down: migration_20261009_021708_add_pages_and_site_settings.down,
    name: '20261009_021708_add_pages_and_site_settings'
  },
];
