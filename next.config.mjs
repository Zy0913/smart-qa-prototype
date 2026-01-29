/** @type {import('next').NextConfig} */
const basePath = '/PreFlow-AI'; // 项目名称的 URL 格式

const nextConfig = {
    output: 'export',
    basePath: basePath,
    images: { unoptimized: true },
};

if (process.env.NODE_ENV !== 'production') {
    // 这里的 IP 和端口必须写死。
    // 注意：末尾强制添加 '/' 是为了防止终端点击时忽略端口号
    const deployUrl = `http://192.168.103.152:32080${basePath}/`;
    const localUrl = `http://localhost:3000${basePath}/`;

    console.log(`\n✅ \x1b[32mReady for development!\x1b[0m`);
    console.log(`   \x1b[36mLocal:\x1b[0m   ${localUrl}`);
    console.log(`   \x1b[35mDeploy:\x1b[0m  ${deployUrl} (Target Server)\n`);
}

export default nextConfig;
