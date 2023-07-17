import { join, resolve } from 'path';
export { join } from 'path';

const root = resolve();
const books = join(root, 'books');

export default {
	books,
	root
}
