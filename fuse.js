const {FuseBox, CSSPlugin, BabelPlugin} = require("fuse-box");

const fuse = FuseBox.init({
    homeDir: 'src',
    output: 'build/$name.js',
    plugins: [
        CSSPlugin(),
        BabelPlugin({
            config: {
                sourceMaps: true,
                presets: ['latest'],
                // plugins: [["transform-react-jsx"]]
            }
        })
    ]
})

fuse.bundle('bundle')
    .instructions(`>index.js`)
    // .hmr()
    // .watch();

fuse.run();
