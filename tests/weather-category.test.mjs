import assert from 'node:assert/strict'
import test from 'node:test'
import { getBackgroundConfig, getWeatherCategory } from '../lib/weather.ts'

test('uses day and night variants for clear conditions', () => {
  assert.equal(getWeatherCategory(1000, true), 'clear')
  assert.equal(getWeatherCategory(1000, false), 'clear-night')
})

test('classifies cloud and visibility conditions explicitly', () => {
  assert.equal(getWeatherCategory(1003, true), 'cloudy')
  assert.equal(getWeatherCategory(1009, true), 'overcast')
  assert.equal(getWeatherCategory(1030, true), 'mist')
  assert.equal(getWeatherCategory(1033, true), 'mist')
})

test('does not mistake patchy precipitation for overcast', () => {
  assert.equal(getWeatherCategory(1063, true), 'rain')
  assert.equal(getWeatherCategory(1066, true), 'snow')
  assert.equal(getWeatherCategory(1069, true), 'snow')
})

test('classifies rain, snow, and thunder families', () => {
  assert.equal(getWeatherCategory(1195, true), 'rain')
  assert.equal(getWeatherCategory(1225, true), 'snow')
  assert.equal(getWeatherCategory(1237, true), 'snow')
  assert.equal(getWeatherCategory(1273, true), 'storm')
  assert.equal(getWeatherCategory(1282, false), 'storm')
})

test('falls back conservatively for newly introduced codes', () => {
  assert.equal(getWeatherCategory(9999, true), 'cloudy')
})

test('keeps the late-morning atmosphere blue and white', () => {
  const background = getBackgroundConfig(
    { period: 'golden-hour-am', hour: 10, label: 'Morning' },
    'overcast'
  )

  assert.equal(background.gradient, 'linear-gradient(180deg, #78b9da 0%, #b9ddeb 48%, #f7fbfd 100%)')
  assert.equal(background.accentColor, '#3a82ad')
})
