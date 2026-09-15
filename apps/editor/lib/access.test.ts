import { describe, expect, test } from 'bun:test'
import { accessToken, safeEqual } from './access'

describe('accessToken', () => {
  test('is stable for the same password', async () => {
    expect(await accessToken('secreto')).toBe(await accessToken('secreto'))
  })

  test('changes when the password rotates', async () => {
    expect(await accessToken('secreto')).not.toBe(await accessToken('secreto2'))
  })

  test('never contains the password', async () => {
    expect(await accessToken('secreto')).not.toContain('secreto')
  })
})

describe('safeEqual', () => {
  test('compares equal strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
  })

  test('rejects different strings and lengths', () => {
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
  })
})
