import { useEffect, useState } from 'preact/hooks';
import { useLive } from '../../hooks';
import {
  addToFolder,
  buildTree,
  createFolder,
  folderTickState,
  listFolders,
  moveToFolder,
  removeFromFolder,
  undoFolderChange,
  type TreeNode
} from '../../folders';
import { db } from '../../db';
import type { Folder, Person } from '../../types';
import { mode, showToast } from '../../state';
import { Sheet } from './common';
import { FolderIcon, PlusIcon } from './Icons';

function Node(props: {
  node: TreeNode;
  depth: number;
  people: Person[];
  moveFromFolderId?: string;
  onPick: (folderId: string) => void;
  addingUnder: string | null;
  setAddingUnder: (id: string | null) => void;
  onCreated: (parentId: string, name: string) => void;
}) {
  const { node } = props;
  const [name, setName] = useState('');
  const tick = !node.isRoot ? folderTickState(props.people, node.key) : undefined;

  return (
    <div>
      <div class="picker-row" style={{ paddingLeft: `${props.depth * 16}px` }}>
        <FolderIcon />
        {node.isRoot ? (
          <span class="picker-root-label">{node.name}</span>
        ) : (
          <button class="picker-name" onClick={() => props.onPick(node.key)}>
            <span class={`tick tick-${tick}`} />
            {node.name}
          </button>
        )}
        <button class="picker-add" onClick={() => props.setAddingUnder(props.addingUnder === node.key ? null : node.key)}>
          <PlusIcon />
        </button>
      </div>
      {props.addingUnder === node.key && (
        <div class="picker-new-row" style={{ paddingLeft: `${(props.depth + 1) * 16}px` }}>
          <input placeholder="New folder name" value={name} onInput={(e) => setName(e.currentTarget.value)} />
          <button
            class="link-btn"
            onClick={() => {
              if (!name.trim()) return;
              props.onCreated(node.key, name.trim());
              setName('');
            }}
          >
            Create
          </button>
        </div>
      )}
      {node.children.map((c) => (
        <Node key={c.key} {...props} node={c} depth={props.depth + 1} />
      ))}
    </div>
  );
}

export function FolderPicker(props: { personIds: string[]; moveFromFolderId?: string; onClose: () => void }) {
  const allFolders = useLive(listFolders, [], [] as Folder[]);
  const tree = buildTree(mode.value, allFolders);
  const [addingUnder, setAddingUnder] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    Promise.all(props.personIds.map((id) => db.people.get(id))).then((all) => setPeople(all.filter((p): p is Person => !!p)));
  }, [props.personIds.join(',')]);

  async function pick(folderId: string) {
    if (props.moveFromFolderId) {
      const snapshot = await moveToFolder(props.personIds, props.moveFromFolderId, folderId);
      showToast('Moved', () => undoFolderChange(snapshot));
    } else {
      const already = folderTickState(people, folderId) === 'all';
      const snapshot = already ? await removeFromFolder(props.personIds, folderId) : await addToFolder(props.personIds, folderId);
      showToast(already ? 'Removed from folder' : 'Added to folder', () => undoFolderChange(snapshot));
    }
    props.onClose();
  }

  async function created(parentId: string, name: string) {
    const id = await createFolder(name, parentId);
    setAddingUnder(null);
    await pick(id);
  }

  return (
    <Sheet>
      <div class="sheet-grab" />
      <div class="section">
        <div class="section-title" style="margin:0 0 8px">
          {props.moveFromFolderId ? 'Move to…' : 'Add to…'}
        </div>
        <div class="picker-tree">
          {tree.map((n) => (
            <Node
              key={n.key}
              node={n}
              depth={0}
              people={people}
              moveFromFolderId={props.moveFromFolderId}
              onPick={pick}
              addingUnder={addingUnder}
              setAddingUnder={setAddingUnder}
              onCreated={created}
            />
          ))}
        </div>
        <button class="link-btn" onClick={props.onClose} style="margin-top:10px">
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
