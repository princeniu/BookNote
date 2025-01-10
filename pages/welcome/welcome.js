Page({
  data: {
    // 页面的初始数据
  },

  onLoad: function () {
    // 页面加载时的处理逻辑
  },

  onEnterTap: function () {
    // 点击进入按钮时的处理
    wx.switchTab({
      url: "/pages/index/index",
      success: function () {
        console.log("成功跳转到首页");
      },
      fail: function (error) {
        console.error("跳转失败：", error);
        wx.showToast({
          title: "跳转失败，请重试",
          icon: "none",
        });
      },
    });
  },
});
