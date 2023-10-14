import { Path } from '@kikiutils/classes';

const root = Path.resolve();
const books = root.join('books');

export default {
	books,
	root
}
