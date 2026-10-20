import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EXTERNAL_PROFILES,
  interpolateKeyframes,
  PROJECTS,
  resolveRouteFromPath,
  resolveRouteFromScroll,
  ROUTES,
  SCENE_KEYFRAMES,
  SPATIAL_INSPECTION_TARGETS,
} from './portfolioData.ts';
import {
  ALL_THOUGHT_FRAGMENTS,
  DRAFT_THOUGHT_FRAGMENTS,
  MIKEY_ORIGINAL_THOUGHTS,
} from './thoughtsData.ts';

describe('MIKEY Portfolio — The Fold & 5-Chapter Domain Logic', () => {
  it('resolveRouteFromPath maps all 5 chapters, case studies, and legacy /contact or /afterword paths to Continue the Conversation', () => {
    assert.equal(resolveRouteFromPath('/').id, 'home');
    assert.equal(resolveRouteFromPath('/about').id, 'about');
    assert.equal(resolveRouteFromPath('/spaces').id, 'spaces');
    assert.equal(resolveRouteFromPath('/work').id, 'work');
    assert.equal(resolveRouteFromPath('/work/zenith').id, 'work-zenith');
    assert.equal(
      resolveRouteFromPath('/work/deadzone-bastion').id,
      'work-deadzone'
    );
    assert.equal(resolveRouteFromPath('/notes').id, 'notes');
    assert.equal(resolveRouteFromPath('/contact').id, 'notes');
    assert.equal(resolveRouteFromPath('/afterword').id, 'notes');

    // Confirm "The Afterword — A Door Left Open" route is completely removed from ROUTES
    assert.equal(
      ROUTES.some((r) => r.chapterTitle.toLowerCase().includes('afterword')),
      false
    );
  });

  it('resolveRouteFromScroll maps continuous 0..1 progress across all 5 chapters', () => {
    assert.equal(resolveRouteFromScroll(0.0).id, 'home');
    assert.equal(resolveRouteFromScroll(0.24).id, 'about');
    assert.equal(resolveRouteFromScroll(0.48).id, 'spaces');
    assert.equal(resolveRouteFromScroll(0.74).id, 'work');
    assert.equal(resolveRouteFromScroll(1.0).id, 'notes');
  });

  it('interpolateKeyframes blends spatial coordinates, foldDepth, and cobalt/amber intensities', () => {
    const mid = interpolateKeyframes(
      SCENE_KEYFRAMES.home,
      SCENE_KEYFRAMES.about,
      0.5
    );
    assert.ok(mid.foldDepth > SCENE_KEYFRAMES.home.foldDepth);
    assert.ok(mid.foldDepth < SCENE_KEYFRAMES.about.foldDepth);
    assert.ok(mid.amberIntensity > SCENE_KEYFRAMES.home.amberIntensity);
  });

  it('MIKEY original thoughts are preserved verbatim and strictly separated from drafts with foldTarget', () => {
    assert.equal(MIKEY_ORIGINAL_THOUGHTS.length, 2);
    assert.equal(
      MIKEY_ORIGINAL_THOUGHTS[0].text,
      'The mirrors in your mind can reflect the best of yourself not the worst of someone else.'
    );
    assert.equal(
      MIKEY_ORIGINAL_THOUGHTS[1].text,
      'The family you think is family is just a stepping stone to real family.'
    );
    for (const orig of MIKEY_ORIGINAL_THOUGHTS) {
      assert.equal(orig.status, 'original');
      assert.equal(typeof orig.foldTarget, 'number');
    }
    for (const draft of DRAFT_THOUGHT_FRAGMENTS) {
      assert.equal(draft.status, 'draft');
      assert.equal(typeof draft.foldTarget, 'number');
    }
    assert.equal(
      ALL_THOUGHT_FRAGMENTS.length,
      MIKEY_ORIGINAL_THOUGHTS.length + DRAFT_THOUGHT_FRAGMENTS.length
    );
  });

  it('verified projects, spatial inspection targets (including The Fold), and all 5 external social profiles match exact supplied URLs', () => {
    assert.equal(
      PROJECTS[0].liveUrl,
      'https://zenith-dusky-theta.vercel.app/'
    );
    assert.equal(
      PROJECTS[1].liveUrl,
      'https://deadzone-bastion.vercel.app/'
    );
    assert.ok(SPATIAL_INSPECTION_TARGETS.wordmark);
    assert.ok(SPATIAL_INSPECTION_TARGETS['the-fold']);
    assert.ok(SPATIAL_INSPECTION_TARGETS.zenith);
    assert.ok(SPATIAL_INSPECTION_TARGETS['deadzone-bastion']);

    assert.equal(EXTERNAL_PROFILES.length, 5);
    assert.deepEqual(
      EXTERNAL_PROFILES.map((p) => ({ label: p.label, url: p.url })),
      [
        {
          label: 'LinkedIn',
          url: 'https://www.linkedin.com/in/harshit-shukla-3386973a5/',
        },
        {
          label: 'GitHub',
          url: 'https://github.com/MIKEY-CODE-HUB',
        },
        {
          label: 'Codeforces',
          url: 'https://codeforces.com/profile/MIKEY1903',
        },
        {
          label: 'Instagram',
          url: 'https://www.instagram.com/the__harshit_shukla/',
        },
        {
          label: 'Spotify',
          url: 'https://open.spotify.com/user/iw0dm14kexc8oatemiwymcqa9',
        },
      ]
    );
  });
});
