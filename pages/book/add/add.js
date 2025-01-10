// pages/book/add/add.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    title: "",
    author: "",
    coverUrl: "",
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
  },

  // 监听输入
  onTitleInput: function (e) {
    this.setData(
      {
        title: e.detail.value,
      },
      this.checkCanSave
    );
  },

  onAuthorInput: function (e) {
    this.setData(
      {
        author: e.detail.value,
      },
      this.checkCanSave
    );
  },

  // 检查是否可以保存
  checkCanSave: function () {
    const canSave = this.data.title.trim() && this.data.author.trim();
    this.setData({ canSave });
  },

  // 选择图片
  onChooseImage: function () {
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({
          coverUrl: tempFilePath,
          tempFilePath: tempFilePath,
        });
      },
    });
  },

  // 上传图片
  uploadImage: function () {
    return new Promise((resolve, reject) => {
      if (!this.data.tempFilePath) {
        resolve(""); // 如果没有选择图片，返回空字符串
        return;
      }

      const fileName = `book_cover_${Date.now()}.jpg`;

      // 这里应该替换为你的图片上传逻辑
      // 示例中将图片保存到本地，实际应该上传到服务器
      wx.saveFile({
        tempFilePath: this.data.tempFilePath,
        success: (res) => {
          resolve(res.savedFilePath);
        },
        fail: (error) => {
          console.error("保存图片失败：", error);
          reject(error);
        },
      });
    });
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack();
  },

  // 保存书籍
  onSave: async function () {
    if (!this.data.canSave) return;

    wx.showLoading({
      title: "保存中...",
      mask: true,
    });

    try {
      // 上传图片
      const coverUrl = await this.uploadImage();

      // 创建新书籍对象
      const book = {
        id: Date.now(),
        title: this.data.title.trim(),
        author: this.data.author.trim(),
        coverUrl: coverUrl || "/assets/images/default-cover.png",
        createTime: new Date().toISOString(),
      };

      // 获取当前书籍列表
      const books = wx.getStorageSync("books") || [];
      books.unshift(book);
      wx.setStorageSync("books", books);

      wx.hideLoading();

      // 尝试通知上一页新书添加成功
      try {
        const eventChannel = this.getOpenerEventChannel();
        if (eventChannel && typeof eventChannel.emit === "function") {
          eventChannel.emit("bookAdded", book);
        }
      } catch (e) {
        console.log("事件通道不可用，但不影响保存");
      }

      // 返回上一页
      wx.navigateBack({
        success: () => {
          // 显示添加成功提示
          wx.showToast({
            title: "添加成功",
            icon: "success",
            duration: 2000,
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
