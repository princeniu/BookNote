Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    userInfo: {},
    signatureLength: 0,
    canSave: false,
    tempFilePath: "", // 临时文件路径
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });

    // 加载用户信息
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = wx.getStorageSync("userInfo") || {};
    this.setData({
      userInfo,
      signatureLength: userInfo.signature ? userInfo.signature.length : 0,
      canSave: userInfo.nickName ? true : false,
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

      this.setData({
        "userInfo.avatarUrl": tempFilePaths[0],
        tempFilePath: tempFilePaths[0],
      });
    } catch (error) {
      console.error("选择头像失败:", error);
      wx.showToast({
        title: "选择头像失败",
        icon: "none",
      });
    }
  },

  // 监听昵称输入
  onNickNameInput: function (e) {
    const nickName = e.detail.value;
    this.setData({
      "userInfo.nickName": nickName,
      canSave: nickName.trim().length > 0,
    });
  },

  // 监听签名输入
  onSignatureInput: function (e) {
    const signature = e.detail.value;
    this.setData({
      "userInfo.signature": signature,
      signatureLength: signature.length,
    });
  },

  // 上传头像
  uploadAvatar: function () {
    return new Promise((resolve, reject) => {
      if (!this.data.tempFilePath) {
        resolve(this.data.userInfo.avatarUrl); // 如果没有选择新头像，返回原头像
        return;
      }

      // 这里应该替换为你的图片上传逻辑
      // 示例中将图片保存到本地，实际应该上传到服务器
      wx.saveFile({
        tempFilePath: this.data.tempFilePath,
        success: (res) => {
          resolve(res.savedFilePath);
        },
        fail: (error) => {
          console.error("保存头像失败：", error);
          reject(error);
        },
      });
    });
  },

  // 返回上一页
  onBackTap: function () {
    const userInfo = wx.getStorageSync("userInfo") || {};
    if (
      JSON.stringify(userInfo) !== JSON.stringify(this.data.userInfo) &&
      this.data.canSave
    ) {
      wx.showModal({
        title: "提示",
        content: "是否保存修改的资料？",
        confirmText: "保存",
        cancelText: "不保存",
        success: (res) => {
          if (res.confirm) {
            this.onSave();
          } else {
            wx.navigateBack();
          }
        },
      });
    } else {
      wx.navigateBack();
    }
  },

  // 保存资料
  onSave: async function () {
    if (!this.data.canSave) return;

    wx.showLoading({
      title: "保存中...",
      mask: true,
    });

    try {
      // 上传头像
      const avatarUrl = await this.uploadAvatar();

      // 更新用户信息
      const userInfo = {
        ...this.data.userInfo,
        avatarUrl,
      };

      // 保存到本地存储
      wx.setStorageSync("userInfo", userInfo);

      wx.hideLoading();

      // 返回上一页
      wx.navigateBack({
        success: () => {
          wx.showToast({
            title: "保存成功",
            icon: "success",
          });
        },
      });
    } catch (error) {
      console.error("保存失败：", error);
      wx.hideLoading();
      wx.showToast({
        title: "保存失败，请重试",
        icon: "none",
      });
    }
  },
});
