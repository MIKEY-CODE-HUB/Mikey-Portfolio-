import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  APPROVED_INTRODUCTION,
  EXTERNAL_PROFILES,
  INTEREST_CLUSTERS,
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

describe('MIKEY Portfolio — Intro Integration & Section Separation Domain Logic', () => {
  it('resolveRouteFromPath maps all 6 sections, case studies, and /social separately from /notes (Attached)', () => {
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
    assert.equal(resolveRouteFromPath('/social').id, 'social');
    assert.equal(resolveRouteFromPath('/contact').id, 'social');
    assert.notEqual(
      resolveRouteFromPath('/notes').id,
      resolveRouteFromPath('/social').id
    );

    // Confirm "The Afterword — A Door Left Open" route is completely removed from ROUTES
    assert.equal(
      ROUTES.some((r) => r.chapterTitle.toLowerCase().includes('afterword')),
      false
    );
  });

  it('resolveRouteFromScroll maps continuous 0..1 progress across all 6 sections including Attached and Social Links', () => {
    assert.equal(resolveRouteFromScroll(0.0).id, 'home');
    assert.equal(resolveRouteFromScroll(0.18).id, 'about');
    assert.equal(resolveRouteFromScroll(0.42).id, 'spaces');
    assert.equal(resolveRouteFromScroll(0.66).id, 'work');
    assert.equal(resolveRouteFromScroll(0.85).id, 'notes');
    assert.equal(resolveRouteFromScroll(1.0).id, 'social');
  });

  it('APPROVED_INTRODUCTION preserves exact approved copy, paragraph structure, Placement Cell membership, and closing beat', () => {
    assert.equal(APPROVED_INTRODUCTION.title, "I'm MIKEY.");
    assert.equal(
      APPROVED_INTRODUCTION.italicLead,
      'Still becoming. I build to understand. I explore to find what understanding misses.'
    );
    assert.equal(APPROVED_INTRODUCTION.paragraphs.length, 3);
    assert.equal(
      APPROVED_INTRODUCTION.paragraphs[0],
      "I'm a Computer Science student at Newton School of Technology, S-VYASA, Bengaluru, drawn to the space between logic and imagination, structure and uncertainty, and the things we know and the questions we haven't learned to ask yet. I enjoy learning how things work, building things of my own, exploring unfamiliar ideas, and looking at the same question from perspectives that don't always agree. My interests move between technology, mathematics, philosophy, psychology, literature, and the countless connections that emerge when different ways of thinking meet."
    );
    assert.equal(
      APPROVED_INTRODUCTION.paragraphs[1],
      "Beyond the technical side, I'm interested in people, the way they think, the stories they tell, and the assumptions that shape how we see the world. Whether it's through a book, a game of chess, a difficult problem, or a conversation that goes somewhere unexpected, I'm always looking for something new to understand. I'm also a member of my institution's Placement Cell in my second year, an opportunity to engage with another side of campus life beyond my own learning and projects."
    );
    assert.equal(
      APPROVED_INTRODUCTION.paragraphs[2],
      "I don't have everything figured out, and I don't feel the need to force myself into a single category. I'm interested in too many questions to settle on one perspective, and I'd rather keep exploring than pretend to have arrived. For me, building is a way to turn curiosity into something tangible; learning is a way to challenge what I think I know."
    );
    assert.equal(
      APPROVED_INTRODUCTION.closingStatement,
      "My contradictions aren't flaws I need to resolve. They're part of the person I'm still becoming."
    );
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

  it('verified projects, spatial inspection targets (including The Fold), Strategy, Motion & Visual Worlds cluster (Cricket), and all 5 external social profiles match exact specifications', () => {
    const playMotionCluster = INTEREST_CLUSTERS.find(
      (c) => c.id === 'play-motion'
    );
    assert.ok(playMotionCluster);
    assert.equal(playMotionCluster.title, 'Strategy, Motion & Visual Worlds');
    assert.ok(
      playMotionCluster.areas.includes('Cricket — Spatial Awareness & Flow')
    );
    assert.equal(
      playMotionCluster.areas.some((a) => a.toLowerCase().includes('basketball')),
      false
    );

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

