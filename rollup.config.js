import strip from '@rollup/plugin-strip';
import path from 'path';
import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import externals from 'rollup-plugin-node-externals';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const inputPath = path.join(__dirname, 'src', 'index.ts');

export default defineConfig({
	// Use this setting to set the package as an external package, such as fs-extra, lodash...etc.
	// Docs: https://rollupjs.org/configuration-options/#external
	external: [],
	input: inputPath,
	output: {
		dir: distPath,
		name: 'index.js',
		format: 'es'
	},
	plugins: [
		// Must remove debugger statements before other plugins.
		strip({ include: ['./src/**/*.ts'] }),
		tsConfigPaths(),
		esbuild({ minify: true }),
		externals()
	]
});
