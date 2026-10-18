import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROUTES,
  PROJECTS,
  EXTERNAL_PROFILES,
  INTEREST_CLUSTERS,
  SCENE_KEYFRAMES,
  resolveRouteFromPath,
  resolveRouteFromScroll,
  interpolateKeyframes,
  dampValue,
  filterInterestsByCluster,
} from './portfolioData.ts';

test('resolveRouteFromPath maps every canonical URL and falls back to home', () => {
  assert.equal(resolveRouteFromPath('/').id, 'home');
  assert.equal(resolveRouteFromPath('/about').id, 'about');
  assert.equal(resolveRouteFromPath('/work/').id, 'work');
  assert.equal(resolveRouteFromPath('/work/zenith').id, 'work-zenith');
  assert.equal(resolveRouteFromPath('/work/deadzone-bastion').id, 'work-deadzone');
  assert.equal(resolveRouteFromPath('/notes').id, 'notes');
  assert.equal(resolveRouteFromPath('/contact').id, 'contact');
  assert.equal(resolveRouteFromPath('/unknown-route').id, 'home');
});

test('resolveRouteFromScroll maps continuous 0..1 progress to world chapters', () => {
  assert.equal(resolveRouteFromScroll(0).id, 'home');
  assert.equal(resolveRouteFromScroll(0.24).id, 'about');
  assert.equal(resolveRouteFromScroll(0.51).id, 'work');
  assert.equal(resolveRouteFromScroll(0.76).id, 'notes');
  assert.equal(resolveRouteFromScroll(0.99).id, 'contact');
});

test('interpolateKeyframes smoothly blends spatial coordinates and paradox parameters', () => {
  const blended = interpolateKeyframes(SCENE_KEYFRAMES.home, SCENE_KEYFRAMES.contact, 0.5);
  assert.equal(blended.fov, (SCENE_KEYFRAMES.home.fov + SCENE_KEYFRAMES.contact.fov) / 2);
  assert.ok(blended.paradoxSeparation > 0 && blended.paradoxSeparation < SCENE_KEYFRAMES.home.paradoxSeparation);
  const damped = dampValue(0, 10, 5, 0.1);
  assert.ok(damped > 0 && damped < 10);
});

test('verified projects and external profiles match exact supplied URLs', () => {
  assert.equal(PROJECTS.length, 2);
  const zenith = PROJECTS.find((p) => p.id === 'zenith');
  const deadzone = PROJECTS.find((p) => p.id === 'deadzone-bastion');
  assert.equal(zenith?.liveUrl, 'https://zenith-dusky-theta.vercel.app/');
  assert.equal(deadzone?.liveUrl, 'https://deadzone-bastion.vercel.app/');
  assert.equal(EXTERNAL_PROFILES.length, 5);
  assert.ok(EXTERNAL_PROFILES.some((p) => p.url === 'https://github.com/MIKEY-CODE-HUB'));
  assert.ok(EXTERNAL_PROFILES.some((p) => p.url === 'https://codeforces.com/profile/MIKEY1903'));
});

test('filterInterestsByCluster filters accurately', () => {
  assert.equal(filterInterestsByCluster(INTEREST_CLUSTERS, 'all').length, 4);
  const quant = filterInterestsByCluster(INTEREST_CLUSTERS, 'quantitative-math');
  assert.equal(quant.length, 1);
  assert.equal(quant[0].title, 'Mathematics & Quantitative Reasoning');
  assert.equal( ROUTES.length, 7);
});
