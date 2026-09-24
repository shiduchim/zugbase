import { render } from 'preact';
import { App } from './ui/App';
import { ensureSeeded } from './db';

ensureSeeded().finally(() => {
  render(<App />, document.getElementById('app')!);
});
