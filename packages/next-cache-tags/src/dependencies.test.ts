import { describe, expect, it } from 'vitest'
import type { CollectionConfig } from 'payload'
import { affectedSources, buildDependents } from './dependencies'
import type { CacheTagDependencySource } from './types'

describe('dependencies', () => {
  it('finds uploads, polymorphic relationships, and joins inside nested fields', () => {
    const collections: CollectionConfig[] = [
      { slug: 'authors', fields: [] },
      { slug: 'categories', fields: [] },
      { slug: 'comments', fields: [] },
      { slug: 'photos', fields: [] },
      {
        slug: 'posts',
        fields: [
          {
            type: 'tabs',
            tabs: [
              {
                label: 'Content',
                fields: [
                  {
                    name: 'sections',
                    type: 'blocks',
                    blocks: [
                      {
                        slug: 'related',
                        fields: [
                          {
                            name: 'items',
                            type: 'array',
                            fields: [
                              {
                                name: 'target',
                                type: 'relationship',
                                relationTo: ['authors', 'categories'],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { name: 'comments', type: 'join', collection: 'comments', on: 'post' },
          { name: 'cover', type: 'upload', relationTo: 'photos' },
        ],
      },
    ]
    const knownSources = new Set<CacheTagDependencySource>([
      'collection:authors',
      'collection:categories',
      'collection:comments',
      'collection:photos',
      'collection:posts',
    ])
    const dependents = buildDependents(collections, [], knownSources, undefined)

    for (const source of [
      'collection:authors',
      'collection:categories',
      'collection:comments',
      'collection:photos',
    ] as const) {
      expect(affectedSources(source, dependents)).toEqual([source, 'collection:posts'])
    }
  })

  it('visits each source once even with cycles, self-references, and overlapping paths', () => {
    const knownSources = new Set<CacheTagDependencySource>([
      'collection:authors',
      'collection:posts',
      'global:site-settings',
    ])
    const dependents = buildDependents([], [], knownSources, {
      'collection:authors': ['collection:authors', 'global:site-settings'],
      'collection:posts': ['collection:authors'],
      'global:site-settings': ['collection:posts', 'collection:authors'],
    })

    expect(affectedSources('collection:authors', dependents)).toEqual([
      'collection:authors',
      'collection:posts',
      'global:site-settings',
    ])
  })
})
