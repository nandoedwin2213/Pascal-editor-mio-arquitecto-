import { describe, expect, test } from 'bun:test'
import { sharePath, shareToken, verifyShareToken } from './share'

describe('shareToken', () => {
  test('is stable for the same secret and scene', async () => {
    expect(await shareToken('s', 'scene-1')).toBe(await shareToken('s', 'scene-1'))
  })

  test('differs per scene and per secret', async () => {
    expect(await shareToken('s', 'scene-1')).not.toBe(await shareToken('s', 'scene-2'))
    expect(await shareToken('s', 'scene-1')).not.toBe(await shareToken('s2', 'scene-1'))
  })

  test('is url-safe hex of fixed length', async () => {
    expect(await shareToken('s', 'scene-1')).toMatch(/^[0-9a-f]{32}$/)
  })
})

describe('verifyShareToken', () => {
  test('accepts the issued token and rejects others', async () => {
    const token = await shareToken('s', 'scene-1')
    expect(await verifyShareToken('s', 'scene-1', token)).toBe(true)
    expect(await verifyShareToken('s', 'scene-2', token)).toBe(false)
    expect(await verifyShareToken('s', 'scene-1', `${token.slice(1)}0`)).toBe(false)
    expect(await verifyShareToken('s', 'scene-1', '')).toBe(false)
  })
})

describe('sharePath', () => {
  test('encodes the scene id', () => {
    expect(sharePath('a b', 'tok')).toBe('/compartir/a%20b/tok')
  })
})
