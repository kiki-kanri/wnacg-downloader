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

// https://rollupjs.org/configuration-options
export default defineConfig({
	input: inputPath,
	output: {
		dir: distPath,
		name: 'index.js',
		format: 'es'
	},
	plugins: [
		// Remove the debugger statement plugin must be loaded before the rest of the plugin with transform method.
		strip({ include: ['./src/**/*.ts'] }),
		tsConfigPaths(),
		esbuild({ minify: true }),
		externals()
	]
});
