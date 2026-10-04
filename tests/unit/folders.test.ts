import { describe, expect, it } from 'vitest';
import { countForNode, directChildren, directPeople, matchesRoot, rootsForMode } from '../../src/folders';
import { ZUGBASE_ROOT } from '../../src/types';
import type { Folder, Person } from '../../src/types';

function person(fields: Partial<Person>): Person {
  return { id: 'x', role: 'guy', name: 'X', text: '', folderIds: [], activities: [], ...fields };
}

describe('matchesRoot', () => {
  it('classifies by role regardless of suggestedToMe — a person can be in Guys and Ideas at once', () => {
    const p = person({ role: 'guy', suggestedToMe: true });
    expect(matchesRoot(p, 'root:guys')).toBe(true);
    expect(matchesRoot(p, 'root:ideas')).toBe(true);
    expect(matchesRoot(p, 'root:girls')).toBe(false);
  });

  it('never silently reclassifies a profile by the owner\'s own "I am" gender', () => {
    /* Regression: filing "Idea for me" used to flip gender from the "I am" setting instead of
       asking, so a guy's profile could land under Girls. Role is always set explicitly now. */
    const guy = person({ role: 'guy', suggestedToMe: true });
    const girl = person({ role: 'girl', suggestedToMe: true });
    expect(matchesRoot(guy, 'root:guys')).toBe(true);
    expect(matchesRoot(girl, 'root:guys')).toBe(false);
  });
});

describe('zugbase tree root', () => {
  const folders: Folder[] = [{ id: 'f1', name: 'Scratch', parentId: ZUGBASE_ROOT, createdAt: 0 }];

  it('lists the built-in category folders plus any custom top-level folders under one root', () => {
    const children = directChildren(ZUGBASE_ROOT, folders, 'shadchan');
    const keys = children.map((c) => c.id);
    expect(keys).toEqual(expect.arrayContaining(['root:guys', 'root:girls', 'root:shadchanim', 'root:ideas', 'root:intake', 'f1']));
  });

  it('holds no people directly — only folders', () => {
    const people = [person({ id: 'p1', role: 'guy' })];
    expect(directPeople(ZUGBASE_ROOT, people)).toEqual([]);
  });

  it('counts everyone across the whole tree', () => {
    const people = [person({ id: 'p1', role: 'guy' }), person({ id: 'p2', role: 'girl' }), person({ id: 'p3', role: 'shadchan' })];
    expect(countForNode(ZUGBASE_ROOT, folders, people)).toBe(3);
  });
});

describe('rootsForMode', () => {
  it('always includes Intake as a folder in the tree', () => {
    expect(rootsForMode('shadchan').some((r) => r.key === 'root:intake')).toBe(true);
    expect(rootsForMode('single').some((r) => r.key === 'root:intake')).toBe(true);
  });

  it('single mode has no separate Guys/Girls — just Ideas, Shadchanim, Other people', () => {
    const keys = rootsForMode('single').map((r) => r.key);
    expect(keys).not.toContain('root:guys');
    expect(keys).toContain('root:others');
  });
});
