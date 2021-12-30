/* eslint-disable */

import * as fs from 'fs';

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

function buildHtml() {
    return {
        name: 'build html',
        writeBundle: () =>
            fs.writeFileSync(
                'dist/index.html',
                `
<html lang="en" charset="UTF-8">
    <head>
        <title>Rfkit</title>
        <meta name="viewport"
            content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <style>
${fs.readFileSync('dist/bundle.css').toString('utf8')}
        </style>
    </head>
    <body>
        <div id="app-root"></div>
        <script>
${fs.readFileSync('dist/bundle.js').toString('utf8')}
        </script>
    </body>
</html>
`
            ),
    };
}

export default {
    input: 'src/index.tsx',
    output: {
        file: 'dist/bundle.js',
        format: 'iife',
    },
    plugins: [
        scss({ outputStyle: 'compressed' }),
        typescript(),
        nodeResolve(),
        replace({
            'process.env.NODE_ENV': '"production"',
        }),
        commonjs(),
        buildHtml(),
        ...(process.env.DEV ? [] : [terser({ format: { comments: false } })]),
    ],
};
