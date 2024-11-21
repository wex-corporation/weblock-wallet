const { withContentlayer } = require('next-contentlayer')
const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'mdx'], // MDX 파일 지원

  webpack: (
    config: import('webpack').Configuration,
    { isServer }: { isServer: boolean }
  ) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          crypto: require.resolve('crypto-browserify'),
          assert: require.resolve('assert'),
          buffer: require.resolve('buffer'),
          stream: require.resolve('stream-browserify')
        }
      }

      config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'], // Buffer 지원 추가
          process: 'process/browser' // process 객체 대체
        })
      ]
    }

    return config
  }
}

module.exports = withContentlayer(nextConfig)
