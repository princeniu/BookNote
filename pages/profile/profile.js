// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    stats: {
      bookCount: 0,
      noteCount: 0,
      dayCount: 0,
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
    this.loadStats();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadStats(); // 每次显示页面时更新统计数据
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync("userInfo") || {};
    this.setData({ userInfo });
  },

  // 加载统计信息
  loadStats() {
    const books = wx.getStorageSync("books") || [];
    const notes = wx.getStorageSync("notes") || [];

    // 计算阅读天数（根据笔记创建时间统计不同的天数）
    const days = new Set();
    notes.forEach((note) => {
      const date = new Date(note.createTime).toDateString();
      days.add(date);
    });

    this.setData({
      stats: {
        bookCount: books.length,
        noteCount: notes.length,
        dayCount: days.size,
      },
    });
  },

  // 选择头像
  async onChooseAvatar() {
    try {
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });

      // 这里可以添加上传头像到服务器的逻辑
      const userInfo = {
        ...this.data.userInfo,
        avatarUrl: tempFilePaths[0],
      };

      wx.setStorageSync("userInfo", userInfo);
      this.setData({ userInfo });

      wx.showToast({
        title: "头像更新成功",
        icon: "success",
      });
    } catch (error) {
      console.error("选择头像失败:", error);
    }
  },

  // 编辑资料
  onEditProfile() {
    wx.navigateTo({
      url: "/pages/profile/edit/edit",
    });
  },

  // 我的笔记
  onMyNotes() {
    wx.navigateTo({
      url: "/pages/note/list/list",
    });
  },

  // 阅读统计
  onReadingStats() {
    wx.navigateTo({
      url: "/pages/profile/stats/stats",
    });
  },

  // 设置
  onSettings() {
    wx.navigateTo({
      url: "/pages/profile/settings/settings",
    });
  },

  // 意见反馈
  onFeedback() {
    wx.navigateTo({
      url: "/pages/profile/feedback/feedback",
    });
  },

  // 关于
  onAbout() {
    wx.navigateTo({
      url: "/pages/profile/about/about",
    });
  },
});
