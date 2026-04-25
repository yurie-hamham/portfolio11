import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'


export default defineConfig({
  root: 'src/',       // ソースコードがあるフォルダ（例：src）
  publicDir: '../static/',  // 静的ファイルの場所（必要に応じて調整）
  server: {
    host: true,       // ネットワークからアクセス可能にしたい場合は true
    open: true        // サーバ起動時にブラウザ自動オープン
  },
  build: {
    outDir: 'dist',   // ビルド出力先（rootからの相対パス）
    emptyOutDir: true,   // ビルド前に出力先を空にする
    sourcemap: false     // ソースマップ生成（開発用）
  },
  plugins: [
    wasm(),
    topLevelAwait(),
  ]
})