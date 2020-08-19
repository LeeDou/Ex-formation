# Ex-formation

### 计划列表

- 单独实现 autotrack 方法，实现自定义的方法获（appLaunch）取事件属性
- quick 方法与 autotrack 完全抽离开，quick 方法不受 autotrack 的配置所限制
- 抽离 applunch 等方法处理，分别处理 autotrack 及 quick
- 修改 setShareInfo 方法，使其功能单一，固定输入，指定的输出，不存在对象引用的传递，再返回内容后在指定地去处理对应的方法
