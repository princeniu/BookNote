Page({
  data: {
    statusBarHeight: 0,
    feedbackTypes: [
      { label: "功能建议", value: "feature" },
      { label: "界面设计", value: "ui" },
      { label: "性能问题", value: "performance" },
      { label: "操作问题", value: "usage" },
      { label: "其他", value: "other" },
    ],
    selectedType: "",
    content: "",
    contact: "",
    images: [],
    canSubmit: false,
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

  // 选择反馈类型
  onTypeSelect: function (e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      selectedType: type,
    });
    this.checkCanSubmit();
  },

  // 输入反馈内容
  onContentInput: function (e) {
    this.setData({
      content: e.detail.value,
    });
    this.checkCanSubmit();
  },

  // 输入联系方式
  onContactInput: function (e) {
    this.setData({
      contact: e.detail.value,
    });
  },

  // 选择图片
  onChooseImage: function () {
    const remainCount = 3 - this.data.images.length;
    wx.chooseImage({
      count: remainCount,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        // 临时文件路径
        const tempFilePaths = res.tempFilePaths;

        this.setData({
          images: [...this.data.images, ...tempFilePaths],
        });
      },
    });
  },

  // 预览图片
  onPreviewImage: function (e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.images,
    });
  },

  // 删除图片
  onDeleteImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images.splice(index, 1);
    this.setData({
      images,
    });
  },

  // 检查是否可以提交
  checkCanSubmit: function () {
    const { selectedType, content } = this.data;
    const canSubmit = selectedType && content.trim().length > 0;
    this.setData({
      canSubmit,
    });
  },

  // 提交反馈
  onSubmit: function () {
    if (!this.data.canSubmit) return;

    wx.showLoading({
      title: "提交中...",
    });

    // 获取当前用户信息
    const userInfo = wx.getStorageSync("userInfo") || {};

    // 构建反馈数据
    const feedback = {
      id: Date.now().toString(),
      type: this.data.selectedType,
      content: this.data.content,
      contact: this.data.contact,
      images: this.data.images,
      createTime: new Date().toISOString(),
      userId: userInfo.id || "",
      status: "pending", // pending, processing, completed
    };

    // 获取现有反馈
    const feedbacks = wx.getStorageSync("feedbacks") || [];

    // 添加新反馈
    feedbacks.unshift(feedback);

    // 保存到本地存储
    wx.setStorageSync("feedbacks", feedbacks);

    // TODO: 上传到服务器
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: "提交成功",
        icon: "success",
        duration: 2000,
        success: () => {
          // 延迟返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        },
      });
    }, 1500);
  },
});
