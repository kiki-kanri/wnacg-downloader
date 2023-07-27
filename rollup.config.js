import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import path from 'path';
import { defineConfig } from 'rollup';
import _esbuild from 'rollup-plugin-esbuild';
import externals from 'rollup-plugin-node-externals';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

const distPath = path.resolve(__dirname, 'dist');
const esbuild = _esbuild.default || _esbuild;
const srcPath = path.resolve(__dirname, 'src', 'index.ts');

export default defineConfig({
	external: ['fs-extra'],
	input: srcPath,
	output: {
		dir: distPath,
		name: 'index.js',
		format: 'cjs'
	},
	plugins: [
		commonjs(),
		esbuild({
			minify: true,
			target: 'esnext'
		}),
		externals(),
		resolve({ extensions: ['.js', '.json', '.mjs', '.node', '.ts'] }),
		strip({ include: ['**/*.ts'] }),
		typescriptPaths({ preserveExtensions: true })
	]
});
