import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import * as fs from 'fs';

function buildHtml() {
    return {
        name: 'build html',
        writeBundle: () =>
            fs.writeFileSync(
                'dist/index.html',
                `
<html>
    <head>
        <title>Rfkit</title>
        <style>
${fs.readFileSync('src/styles.css').toString('utf8')}
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
    plugins: [typescript(), nodeResolve(), buildHtml()],
};
