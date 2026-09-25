import { render } from 'preact';
import { App } from './ui/App';
import { ensureSeeded, purgeOldDeleted } from './db';

ensureSeeded()
  .then(purgeOldDeleted)
  .finally(() => {
    render(<App />, document.getElementById('app')!);
  });
