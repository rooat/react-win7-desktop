# wxMiniStore 
[![NPM version](https://img.shields.io/npm/v/wxministore.svg)](https://www.npmjs.com/package/wxministore)   
一个基于原生小程序的mini全局状态管理库，五行代码即可引入。
* 全局状态state支持所有Page和Component，状态完全同步，并提供api更新状态。
* 周期监听pageLisener能监听所有页面的onLoad，onShow等周期事件。
* 全局事件methods，全局可用的方法。
* 适合原生小程序，可以随时引入，不影响原有的业务，拓展性强。

<p>
<iframe src="https://ghbtns.com/github-btn.html?user=yx675258207&repo=wxministore&type=star&count=true&size=small" style="display: inline-block" frameborder="0" scrolling="0" width="160px" height="30px"></iframe> 
</p>


### 导航
* [开始](#start)  
* [全局状态](#state)
* [局部状态模式](#part)
* [全局页面周期](#lisener)
* [全局方法](#f)
* [non-writable解决方案](#nonWritable)
* [Api说明](#api)
* [总结及建议](#end)


## <div id="start">开始</div>


### 1. 引入
目前有两种引入方式：
#### npm
 首先你需要npm init 在项目目录下生成 package.json后，再进行安装。
 ``` cmd
 npm init
 npm install wxministore -S
 ```
 然后在微信小程序右上角详情中勾选 `使用npm模块`。  
 接着选择左上角 工具-构建 npm。 
 这样你就可以在项目中导入了。
 
 ```js
//app.js中
import Store from 'wxministore';
//或者 const Store = require('wxministore');
App({
})
```
#### clone
如果不太熟悉npm没关系，你可以将本项目中util下的store.js复制到你的项目中，并在`app.js第一行`引入：
```js
//app.js中
import Store from './util/store.js';
//或者 const Store = require('./util/store.js');
App({
})
```
### <div id="state">2. 实例化一个全局状态 state</div>
Store 允许传一个参数，类型为Object，全局状态写入对象state中，读取请使用store.$state。
```js 
let store = new Store({
  //。
  state: {
    msg: '这是一个全局状态'
  }
})
console.log(store.$state.msg); //这是一个全局状态
App({
})
```
### 3.在App中注入store
这么做是为了在其他页面中使用store。
```js
App({
  onLaunch: function () {

  },
  store: store
})
```
### 4.页面上使用
在所有wxml中，可使用$state.x。
其中$state为全局状态的容器，里面包含了所有的全局状态。
```html
  <view>{{$state.user.name}}：{{$state.msg}}</view>
```
显示为 李四：这是一个全局状态。

如果在template文件中使用，需在属性data中引用$state
```html
  <!-- 这是一个template -->
  <template name="t1">
    <view>{{$state.msg}}</view>
  </template>

<!-- 这是引用位置 -->
  <template is="t1" data="{{$state,arg1,arg2}}" />
<!--   相当于<template is="t1" data="{{$state:$state,arg1:arg1,arg2:arg2}}" /> -->
```

### 5.如何修改状态
js中使用app中的store来进行操作状态。具体参见下面api说明。
```js
const app = getApp()
Page({
  data: {

  },
  onLoad: function () {
    //所有wxml中的$state.msg会同步更新
    app.store.setState({
       msg: "我被修改了，呜呜..."
    });
  }
});

```
## <div id="part">状态局部模式</div>
在项目的组件和页面越来越多且复用率越来越高时，全局$state的利用率就很低，这时候就出现了一种情况，页面中的组件和页面达到百千量级，每个内部都有一个$state，而用到它的可能就只有1个或几个。就会引起各种性能问题。比如更新$state十分缓慢，且低效。  
这时候你需要将$state调整为部分组件和页面可用，而不是所有。
### 1.开启局部模式
``` js
let store = new Store({
  //。
  state: {
    msg: '这是一个全局状态'
  },
  openPart: true
})
```
openPart 字段表示是否开启局部模式，默认值为false。当我们想规定只有某些页面和组件使用$state时，就需开启此模式，设置为true。  
### 2.设置范围
在需要使用$state的组件中，加入`userStore: true`，表示当前页面或组件可用$state。
``` js
// a.js
Page({
  useStore: true,
  onLoad(){
    console.log(this.data.$state) // { msg: '这是一个全局状态' }
    console.log(getApp().store.$state) // { msg: '这是一个全局状态' }
  }
})

// b.js
Page({
  onLoad(){
    console.log(this.data.$state) // undefined
    console.log(getApp().store.$state) // { msg: '这是一个全局状态' }
  }
})
```
a页面设置了Store可用，所以可以通过this.data.$state获取。
b页面没有设置，所以为undefined，但两个页面均可通过store.$state获取。
``` html
<--! a页面有效 -->
<view>{{$state.msg}}</view>

<--! b页面无效 -->
<view>{{$state.msg}}</view>
```

### 3.注意事项
* openPart一旦开启，所有没有设置useStore的页面和组件将不能在wxml中使用$state。
* 组件或页面.js中，我们建议使用getApp().store.$state去获取全局状态，因为他没有限制。
* 仅在wxml中需要用到$state的页面和组件中开启useStore。



## <div id="lisener">周期监听 pageLisener</div>
在有的场景，我希望每个页面在onLoad时执行一个方法（如统计页面，监听等）。原本做法是一个一个的复制粘贴，很麻烦。  
现在我们可以把某个周期，写入pageLisener中，Store会自动在`相应周期优先执行pageLisnner然后再执行原页面周期内事件`。

### 1.加入监听
现在以监听onLoad为例， 在Store中新增一个pageLisener对象，将需要监听的周期写入:
```js
// store中
let store = new Store({
    //状态
    state: {
		//...
    },
    //方法
    methods: {
		//...
    },
    //页面监听
    pageLisener: {
        onLoad(options){
            console.log('我在' + this.route, '参数为', options);
        }
    }
})
```
就这样所有页面的onLoad，将会优先执行此监听。接下来看页面内代码：

```js
// index/index.js 页面
Page({
    onLoad(){
        console.log(2)
    }
})
```
执行结果为:
``` js
// 我在index/index 参数为 {...} 
// 2
```
### 2.没有第二步...
总结：  
* 先执行pageLisener监听，后执行原本页面中周期。
* 还支持其他周期事件 ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap']

## <div id="f">全局方法 methods</div>
  新增methods，全局可使用。
  适用于各个wxml中的交互事件(bindtap等), 你可以封装一些常用的交互事件，如 行为埋点，类型跳转等。
  ### 1.创建一个全局方法
  在原有状态基础上，新增一个methods对象，写入你的全局方法：
  ```js
let store = new Store({
    //状态
    state: {
        msg: '这是一个全局状态'
    },
    //方法
    methods: {
        goAnyWhere(e){
            wx.navigateTo({
                url: e.currentTarget.dataset.url
            })
        },
        sayHello(){
            console.log('hello')
        }
    }
})
  ```
  这里创建了一个全局封装的跳转 goAnyWhere。


  ### 2.使用全局方法
  在wxml中，直接使用`方法名`调用:
  ```html
<view bindtap="goAnyWhere" data-url="/index/index">
    首页
</view>
  ```
  在js中，直接使用 `this.方法名` 来调用:
  ```js
Page({
    onLoad(){
        this.sayHello();
    }
})
  ```
  在非页面的js中，我们不建议使用Store中的全局方法。但你可使用getCurrentPage().pop().sayHello() 来调用。

  ### 3.说明
  * 尽量封装复用率高的全局方法
  * 非交互型事件（即非bindxx）的公用方法，建议不写入Store中。写入App中更好。

## <div id="nonWritable">non-writable解决方案</div>

  收到开发者的反馈，在小程序中使用插件时，会报错提示:  
  ```js
   // [non-writable] modification of global variable "Page" is not allowed when using plugins at app.json.
   // 在app.json中使用插件时，不允许修改全局变量 Page 
  ```
  原因是store源码重写了Page、Component方法。  
  
  ### 1、开启防改写
  在你的store配置中，加入 `nonWritable: true`。  
  ```js
  let store = new Store({
    nonWritable: true
  })
  ```
  ### 2、创建页面与组件调整
  将你所有页面与组件创建方法改为`App.Page(...) 和 App.Component(...)`。
  ```js
  //页面.js
  const app = getApp()
  App.Page({
    data: {

    },
    onLoad: function () {
    }
  });

  //组件.js
  App.Component({
    data: {

    }
  });
  ```
  以上就解决了此问题。


## <div id="api">api</div>
这里列举了所有涉及到Store的属性与方法。
### new Store(options: Object) *已更新
该函数使用new关键字返回一个Store类型的实例。
参数options，为配置参数，
options.state 为初始全局状态。
options.methods 为全局方法。
options.openPart 状态局部模式。
options.pageLisener 周期监听
options.nonWritable 是否重写Page，Componenet。

### Store.prototype.setState(Object data, Function callback)
用于修改全局状态，用法与微信小程序的 Page.prototype.setData完全一致。在页面中调用setState的数据为同步，渲染为异步。在页面未加载完成时，调用setState的数据为异步（页面周期attached时完成），渲染为异步。
*提示：页面中应避免使用this.setData({\$state: ...})去操作当前页面下的$state。如有相关需求，请使用页面其他状态存储。*

### store.\$state : Object
该对象为实例.$state， 返回的是全局状态（1.2版完全引用）。应避免直接操作修改它。

### store.$r : Object
该对象为所有页面或组件的实例。  


## <div id="end">总结及建议</div>
考虑到后期的app.js内store不直观，可以把整套store单独写入一个js中，通过require引入。如：
  ``` js
// mystore.js中
const Store = require('../util/store.js');
module.exports = new Store({
    state: {},
    methods: {}
})
//---------------------------
// app.js中
let store = require('store/mystore.js')
App({
    store
})
  ```

MiniStore非常适合原生小程序。可以随时引入，不影响原有的业务，拓展性强。
