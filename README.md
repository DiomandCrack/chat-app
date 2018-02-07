# chat-app

## 安装

app:

```shell
cd app
npm i
```

server:

```shell
cd server
npm i
```

安装mongoDB[mongoDB](https://www.mongodb.com/download-center?jmp=nav#atlas)

可以使用mongoDB可视化工具:[robo3T](https://robomongo.org)

**由于安装了bcrypt 用于密码加密 依赖`node-gyp` 安装前需要配置环境 否则将会报错 依赖无法安装成功**

## window下安装`node-gyp`

安装`node-gyp`:
参考[node.js/node-gyp](https://github.com/nodejs/node-gyp)

- 方案一

    安装[windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)
    powershell管理员权限下运行`npm install --global --production windows-build-tools`

- 方案二

    1. 安装[Visual C++ 2015 Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools)

    2. 安装[Visual Studio 2015](https://www.visualstudio.com/vs/community/)(社区版)

    3. 安装[python2.7](https://www.python.org/downloads/)(v3.x.x不支持)

    4. 命令行`npm config set msvs_version 2015`

如果安装多个版本的`python` 运行`node-gyp --python /path/to/python2.7`和`npm config set python /path/to/executable/python2.7`

如果还不好使，那就只能参考[Microsoft's Node.js Guidelines for Windows](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules)

## 运行

app:
端口号:3000

```shell
yarn start
```

server
端口号:3001

```shell
npm run dev
```
