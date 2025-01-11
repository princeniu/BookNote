Page({
  data: {
    statusBarHeight: 0,
    version: "1.0.0",
    updateTime: "2024-01-20",
    currentYear: new Date().getFullYear(),
  },

  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack();
  },

  // 分享给朋友
  onShareAppMessage: function () {
    return {
      title: "读书笔记 - 你的专属读书助手",
      path: "/pages/welcome/welcome",
      imageUrl: "/assets/images/share.png", // 分享图片
    };
  },

  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: "读书笔记 - 你的专属读书助手",
      query: "",
      imageUrl: "/assets/images/share.png",
    };
  },
});
