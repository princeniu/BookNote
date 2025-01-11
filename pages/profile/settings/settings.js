Page({
  data: {
    statusBarHeight: 0,
    version: "1.0.0",
    theme: "light",
    fontSize: "medium",
    autoBackup: false,
    lastBackupTime: "",
    passwordEnabled: false,
  },

  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });

    // 加载设置
    this.loadSettings();
  },

  // 加载设置
  loadSettings: function () {
    const settings = wx.getStorageSync("settings") || {};
    this.setData({
      theme: settings.theme || "light",
      fontSize: settings.fontSize || "medium",
      autoBackup: settings.autoBackup || false,
      lastBackupTime: settings.lastBackupTime || "",
      passwordEnabled: settings.passwordEnabled || false,
    });
  },

  // 保存设置
  saveSettings: function (settings) {
    const currentSettings = wx.getStorageSync("settings") || {};
    const newSettings = { ...currentSettings, ...settings };
    wx.setStorageSync("settings", newSettings);
    this.setData(settings);
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack();
  },

  // 选择主题
  onThemeSelect: function () {
    wx.showActionSheet({
      itemList: ["浅色", "深色"],
      success: (res) => {
        const theme = res.tapIndex === 0 ? "light" : "dark";
        this.saveSettings({ theme });
      },
    });
  },

  // 选择字体大小
  onFontSizeSelect: function () {
    wx.showActionSheet({
      itemList: ["小", "中", "大"],
      success: (res) => {
        const sizes = ["small", "medium", "large"];
        this.saveSettings({ fontSize: sizes[res.tapIndex] });
      },
    });
  },

  // 切换自动备份
  onAutoBackupChange: function (e) {
    const autoBackup = e.detail.value;
    this.saveSettings({ autoBackup });

    if (autoBackup) {
      wx.showToast({
        title: "已开启自动备份",
        icon: "success",
      });
    }
  },

  // 立即备份
  onBackupNow: function () {
    wx.showLoading({
      title: "备份中...",
    });

    // 获取所有数据
    const data = {
      books: wx.getStorageSync("books") || [],
      notes: wx.getStorageSync("notes") || [],
      settings: wx.getStorageSync("settings") || {},
    };

    // 将数据转换为字符串
    const backupStr = JSON.stringify(data);

    // 保存备份时间
    const now = new Date();
    const lastBackupTime = this.formatTime(now);
    this.saveSettings({ lastBackupTime });

    // TODO: 实现云端备份
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: "备份成功",
        icon: "success",
      });
    }, 1500);
  },

  // 切换密码锁
  onPasswordChange: function (e) {
    const passwordEnabled = e.detail.value;

    if (passwordEnabled) {
      // 设置密码
      wx.navigateTo({
        url: "/pages/profile/password/set/set",
        events: {
          // 密码设置成功的回调
          passwordSet: () => {
            this.saveSettings({ passwordEnabled: true });
          },
        },
      });
    } else {
      // 关闭密码锁
      this.saveSettings({ passwordEnabled: false });
      wx.showToast({
        title: "已关闭密码锁",
        icon: "success",
      });
    }
  },

  // 修改密码
  onChangePassword: function () {
    wx.navigateTo({
      url: "/pages/profile/password/change/change",
    });
  },

  // 关于页面
  onAboutTap: function () {
    wx.navigateTo({
      url: "/pages/profile/about/about",
    });
  },

  // 意见反馈
  onFeedbackTap: function () {
    wx.navigateTo({
      url: "/pages/profile/feedback/feedback",
    });
  },

  // 退出登录
  onLogout: function () {
    wx.showModal({
      title: "确认退出",
      content: "是否确认退出登录？",
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync("userInfo");

          // 返回登录页
          wx.reLaunch({
            url: "/pages/welcome/welcome",
          });
        }
      },
    });
  },

  // 格式化时间
  formatTime: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
});
