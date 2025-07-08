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

const htmlFiles = glob.sync('./public/*.html');

const htmlPlugins = htmlFiles.map(file => {
    const filename = path.basename(file);
    return new HtmlWebpackPlugin({
        template: file,
        filename: filename,
        chunks: ['main']
    });
});

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src/js/index.js')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.html', '.css']
    },
    plugins: [
        ...htmlPlugins
    ],
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 8080,
        open: true,
        hot: true,
        historyApiFallback: true
    },
    mode: 'production' // Matches npm run build
};