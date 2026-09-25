import { useLive } from '../../hooks';
import { db } from '../../db';
import { listDeleted, restorePerson } from '../../repo';
import type { Person } from '../../types';
import { closeTop } from '../../state';
import { Sheet } from '../parts/common';
import { BackIcon } from '../parts/Icons';

export function DeletedScreen() {
  const deleted = useLive(listDeleted, [], [] as Person[]);

  return (
    <Sheet full>
      <div class="person-header">
        <button class="back-btn" onClick={closeTop}>
          <BackIcon />
        </button>
        <div class="name">Recently deleted</div>
      </div>
      <div class="rows" style="padding:0 14px 20px">
        {deleted.length === 0 && <div class="empty-state">Nothing deleted</div>}
        {deleted.map((p) => (
          <div key={p.id} class="row">
            <div class="info">
              <div class="name">{p.name || '(no name)'}</div>
              <div class="sub">Deleted {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : ''}</div>
            </div>
            <button class="btn btn-primary" onClick={() => restorePerson(p.id)}>
              Restore
            </button>
            <button
              class="link-btn"
              style="color:var(--danger)"
              onClick={async () => {
                if (confirm(`Delete "${p.name}" for good? This cannot be undone.`)) {
                  await db.files.where('personId').equals(p.id).delete();
                  await db.people.delete(p.id);
                }
              }}
            >
              Forever
            </button>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
