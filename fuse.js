const {FuseBox, CSSPlugin, WebIndexPlugin, BabelPlugin} = require("fuse-box");
const dev = process.env.NODE_ENV === 'dev';

const fuse = FuseBox.init({
    homeDir: 'src',
    output: 'build/$name.js',
    plugins: [
        CSSPlugin(),
        WebIndexPlugin({
            template: 'src/index.html'
        }),
        BabelPlugin({
            config: {
                sourceMaps: true,
                presets: ['latest'],
                // plugins: [["transform-react-jsx"]]
            }
        })
    ]
})

const app = fuse.bundle('bundle').instructions('>index.js');

if (dev) {
    fuse.dev();
    app.watch().hmr();
}

fuse.run();
