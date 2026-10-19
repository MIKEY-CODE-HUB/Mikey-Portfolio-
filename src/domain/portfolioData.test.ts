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
import {
  MIKEY_ORIGINAL_THOUGHTS,
  DRAFT_THOUGHT_FRAGMENTS,
  ALL_THOUGHT_FRAGMENTS,
  getThoughtById,
} from './thoughtsData.ts';

test('resolveRouteFromPath maps all 6 novel chapters and case study routes', () => {
  assert.equal(resolveRouteFromPath('/').id, 'home');
  assert.equal(resolveRouteFromPath('/about').id, 'about');
  assert.equal(resolveRouteFromPath('/spaces').id, 'spaces');
  assert.equal(resolveRouteFromPath('/work/').id, 'work');
  assert.equal(resolveRouteFromPath('/work/zenith').id, 'work-zenith');
  assert.equal(resolveRouteFromPath('/work/deadzone-bastion').id, 'work-deadzone');
  assert.equal(resolveRouteFromPath('/notes').id, 'notes');
  assert.equal(resolveRouteFromPath('/contact').id, 'contact');
  assert.equal(resolveRouteFromPath('/unknown-route').id, 'home');
});

test('resolveRouteFromScroll maps continuous 0..1 progress across all 6 chapters', () => {
  assert.equal(resolveRouteFromScroll(0).id, 'home');
  assert.equal(resolveRouteFromScroll(0.19).id, 'about');
  assert.equal(resolveRouteFromScroll(0.39).id, 'spaces');
  assert.equal(resolveRouteFromScroll(0.61).id, 'work');
  assert.equal(resolveRouteFromScroll(0.83).id, 'notes');
  assert.equal(resolveRouteFromScroll(0.99).id, 'contact');
});

test('interpolateKeyframes blends spatial coordinates and cobalt/amber intensities', () => {
  const blended = interpolateKeyframes(SCENE_KEYFRAMES.home, SCENE_KEYFRAMES.spaces, 0.5);
  assert.equal(blended.fov, (SCENE_KEYFRAMES.home.fov + SCENE_KEYFRAMES.spaces.fov) / 2);
  assert.ok(blended.amberIntensity > SCENE_KEYFRAMES.home.amberIntensity);
  const damped = dampValue(0, 10, 5, 0.1);
  assert.ok(damped > 0 && damped < 10);
});

test('MIKEY original thoughts are preserved verbatim and strictly separated from drafts', () => {
  assert.equal(MIKEY_ORIGINAL_THOUGHTS.length, 2);
  assert.equal(
    MIKEY_ORIGINAL_THOUGHTS[0].text,
    'The mirrors in your mind can reflect the best of yourself not the worst of someone else.'
  );
  assert.equal(
    MIKEY_ORIGINAL_THOUGHTS[1].text,
    'The family you think is family is just a stepping stone to real family.'
  );
  assert.ok(MIKEY_ORIGINAL_THOUGHTS.every((t) => t.origin === 'mikey-original' && t.status === 'original'));
  assert.ok(DRAFT_THOUGHT_FRAGMENTS.every((t) => t.origin === 'draft' && t.status === 'draft'));
  assert.equal(ALL_THOUGHT_FRAGMENTS.length, MIKEY_ORIGINAL_THOUGHTS.length + DRAFT_THOUGHT_FRAGMENTS.length);
  assert.equal(getThoughtById('mikey-mirrors').id, 'mikey-mirrors');
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
  assert.equal(filterInterestsByCluster(INTEREST_CLUSTERS, 'all').length, 4);
  assert.equal(ROUTES.length, 8);
});
