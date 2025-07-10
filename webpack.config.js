// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = {
//   entry: './src/index.js',
//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     filename: 'bundle.[contenthash].js',
//     clean: true,
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env'],
//           },
//         },
//       },
//       {
//         test: /\.css$/,
//         use: ['style-loader', 'css-loader'],
//       },
//       {
//         test: /\.(png|svg|jpg|jpeg|gif)$/i,
//         type: 'asset/resource',
//       },
//     ],
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//       template: './public/indext.html',
//       filename: 'indext.html',
//     }),
//   ],
//   devServer: {
//     static: {
//       directory: path.join(__dirname, 'public'),
//     },
//     compress: true,
//     port: 8080, // Changed port to 8080
//     host: 'localhost',
//     open: true,
//     hot: true,
//     historyApiFallback: true,
//     client: {
//       overlay: true,
//       progress: true,
//     },
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     },
//   },
// };




const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

const htmlFiles = glob.sync('./public/*.html'); // This should include registration.html

const htmlPlugins = htmlFiles.map(file => {
    const filename = path.basename(file);
    return new HtmlWebpackPlugin({
        template: file,
        filename: filename,
        chunks: ['main'],
    });
});

module.exports = {
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        ...htmlPlugins, // This should now include registration.html
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 8080,
        host: 'localhost',
        open: true,
        hot: true,
        historyApiFallback: true,
    },
};



// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const glob = require('glob');

// const htmlFiles = glob.sync('./public/*.html');

// const htmlPlugins = htmlFiles.map(file => {
//     const filename = path.basename(file);
//     return new HtmlWebpackPlugin({
//         template: file,
//         filename: filename,
//         chunks: ['main'], // Ensures bundle.js is injected
//     });
// });

// // Sort plugins to prioritize landing.html
// htmlPlugins.sort((a, b) => {
//     if (a.options.filename === 'landing.html') return -1;
//     if (b.options.filename === 'landing.html') return 1;
//     return 0;
// });

// module.exports = {
//     entry: path.resolve(__dirname, 'src/js/index.js'),
//     output: {
//         path: path.resolve(__dirname, 'dist'),
//         filename: 'bundle.[contenthash].js',
//         clean: true,
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 exclude: /node_modules/,
//                 use: {
//                     loader: 'babel-loader',
//                     options: {
//                         presets: ['@babel/preset-env'],
//                     },
//                 },
//             },
//             {
//                 test: /\.css$/,
//                 use: ['style-loader', 'css-loader'],
//             },
//             {
//                 test: /\.(png|svg|jpg|jpeg|gif)$/i,
//                 type: 'asset/resource',
//             },
//         ],
//     },
//     plugins: [
//         ...htmlPlugins,
//     ],
//     devServer: {
//         static: {
//             directory: path.join(__dirname, 'dist'), // Serve from dist after build
//         },
//         compress: true,
//         port: 8080,
//         host: 'localhost',
//         open: true, // Opens the browser automatically
//         hot: true,
//         historyApiFallback: true, // Allows navigation between HTML files
//         // Redirect to landing.html by default
//         onBeforeSetupMiddleware(devServer) {
//             devServer.app.get('/', (req, res) => {
//                 res.redirect('/landing.html');
//             });
//         },
//     },
// };