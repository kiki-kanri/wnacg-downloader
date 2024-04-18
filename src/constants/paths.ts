import Path from '@kikiutils/classes/path';

const root = Path.resolve();
const books = root.join('books');

export default { books, root };
