import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { defineConfig } from 'rollup';
import externals from 'rollup-plugin-node-externals';

const distPath = path.resolve(__dirname, 'dist');
const srcPath = path.resolve(__dirname, 'src', 'index.ts');

export default defineConfig({
	input: srcPath,
	output: {
		dir: distPath,
		name: 'index.js',
		format: 'cjs'
	},
	plugins: [
		commonjs(),
		externals(),
		resolve(),
		strip({
			include: ['**/*.ts']
		}),
		terser({
			module: true
		}),
		typescript({
			module: 'esnext'
		})
	]
});
