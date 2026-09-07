import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { organizations, sources } from '../data/catalog';
import assets from '../data/media.json';

void test('field evidence references resolve and supported fields contain citations', () => {
  const ids = new Set(sources.map((s) => s.id));
  for (const org of organizations) {
    for (const evidence of Object.values(org.evidence ?? {})) {
      assert.ok(Number.isFinite(Date.parse(evidence.checkedAt)), org.id);
      if (evidence.status === 'supported')
        assert.ok(evidence.sourceIds.length, org.id);
      for (const id of evidence.sourceIds)
        assert.ok(ids.has(id), `${org.id}: ${id}`);
    }
    if (org.commander?.assumedOffice) {
      assert.ok(
        Date.parse(org.commander.assumedOffice) <=
          Date.parse(org.commander.asOf),
        org.id,
      );
    }
  }
});

void test('published portraits match the named leader and retain attribution and local files', () => {
  const byId = new Map(assets.map((a) => [a.id, a]));
  assert.equal(byId.size, assets.length);
  for (const org of organizations) {
    if (!org.commander?.portraitId) continue;
    const asset = byId.get(org.commander.portraitId);
    assert.ok(asset, org.id);
    assert.equal(asset.subject, org.commander.name);
    assert.equal(asset.identityStatus, 'verified');
    assert.ok(asset.credit && asset.rights);
    for (const url of [asset.url, asset.sourceUrl, asset.rightsUrl]) {
      assert.equal(new URL(url).protocol, 'https:');
    }
    assert.ok(asset.localPath.startsWith('/portraits/'));
    assert.ok(existsSync(resolve('public', asset.localPath.slice(1))));
    if ('focalPoint' in asset) {
      assert.equal(asset.focalPoint?.length, 2);
      for (const value of asset.focalPoint ?? [])
        assert.ok(value >= 0 && value <= 1);
    }
  }
});

void test('joint browsing and announced NCC transitions do not imply operational subordination', () => {
  const anc = organizations.find((o) => o.id === 'in-joint-andaman-nicobar')!;
  assert.equal(anc.classification, 'tri-service');
  assert.equal(anc.service, 'navy');
  assert.equal(anc.relationshipKind, 'service-affiliation');
  for (const id of ['in-ncc-andhra-pradesh', 'in-ncc-jharkhand']) {
    const org = organizations.find((o) => o.id === id)!;
    assert.equal(org.status, 'newly-approved');
    assert.equal(org.location, null);
    assert.equal(org.commander, undefined);
    assert.equal(org.evidence?.headquarters?.status, 'unverified');
  }
});
