export interface Info {
  version: string,
  buildTime: string,
}

export const __INFO: Info = {
  version: '4.4.12',
  buildTime: '2024-03-27T12:16:41.259Z', // 编译时会通过 version-sync.js 自动更新
};
