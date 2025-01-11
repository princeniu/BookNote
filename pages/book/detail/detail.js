// pages/book/detail/detail.js
Page({
  data: {
    statusBarHeight: 0,
    book: null,
    notes: [],
    noteCount: 0,
    readingDays: 0,
    showOptions: false,
    bookId: null,
  },

  onLoad: function (options) {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      bookId: options.id,
    });

    // 加载数据
    this.loadPageData();
  },

  // 加载页面数据
  loadPageData: function () {
    const { bookId } = this.data;
    if (!bookId) return;

    console.log("Loading book with ID:", bookId); // 调试日志

    // 加载书籍信息
    const books = wx.getStorageSync("books") || [];
    console.log("All books:", books); // 调试日志

    // 确保使用字符串比较
    const book = books.find((b) => String(b.id) === String(bookId));
    console.log("Found book:", book); // 调试日志

    if (!book) {
      wx.showToast({
        title: "书籍不存在",
        icon: "error",
        duration: 2000,
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }

    // 加载笔记数据
    const notes = wx.getStorageSync("notes") || [];
    const bookNotes = notes
      .filter((note) => String(note.bookId) === String(bookId)) // 确保使用字符串比较
      .map((note) => ({
        ...note,
        createTimeFormatted: this.formatTime(new Date(note.createTime)),
      }))
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime)); // 按时间倒序排列

    // 计算阅读天数
    const readingDays = new Set(
      bookNotes.map(
        (note) => new Date(note.createTime).toISOString().split("T")[0]
      )
    ).size;

    // 更新页面数据
    this.setData({
      book,
      notes: bookNotes,
      noteCount: bookNotes.length,
      readingDays,
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

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack();
  },

  // 显示操作菜单
  showActionSheet: function () {
    wx.showActionSheet({
      itemList: ["编辑书籍", "删除书籍"],
      itemColor: "#333333",
      success: (res) => {
        if (res.tapIndex === 0) {
          this.editBook();
        } else if (res.tapIndex === 1) {
          this.deleteBook();
        }
      },
    });
  },

  // 编辑书籍
  editBook: function () {
    wx.navigateTo({
      url: `/pages/book/add/add?id=${this.data.bookId}`,
    });
  },

  // 删除书籍
  deleteBook: function () {
    wx.showModal({
      title: "确认删除",
      content: "删除书籍将同时删除该书的所有笔记，是否继续？",
      confirmColor: "#e64340",
      success: (res) => {
        if (res.confirm) {
          // 删除书籍
          const books = wx.getStorageSync("books") || [];
          const updatedBooks = books.filter(
            (b) => String(b.id) !== String(this.data.bookId)
          );
          wx.setStorageSync("books", updatedBooks);

          // 删除相关笔记
          const notes = wx.getStorageSync("notes") || [];
          const updatedNotes = notes.filter(
            (n) => String(n.bookId) !== String(this.data.bookId)
          );
          wx.setStorageSync("notes", updatedNotes);

          wx.showToast({
            title: "已删除",
            icon: "success",
            duration: 2000,
          });

          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      },
    });
  },

  // 显示笔记选项
  showNoteOptions: function () {
    this.setData({ showOptions: true });
  },

  // 隐藏笔记选项
  hideNoteOptions: function () {
    this.setData({ showOptions: false });
  },

  // 阻止事件冒泡
  stopPropagation: function () {
    // Do nothing
  },

  // 添加文字笔记
  onAddTextNote: function () {
    this.hideNoteOptions();
    wx.navigateTo({
      url: `/pages/note/text/text?bookId=${this.data.bookId}`,
    });
  },

  // 添加语音笔记
  onAddVoiceNote: function () {
    this.hideNoteOptions();
    wx.navigateTo({
      url: `/pages/note/voice/voice?bookId=${this.data.bookId}`,
    });
  },

  // 查看笔记详情
  onNoteTap: function (e) {
    const note = e.currentTarget.dataset.note;
    wx.navigateTo({
      url: `/pages/note/detail/detail?id=${note.id}`,
    });
  },

  // 页面显示时刷新数据
  onShow: function () {
    this.loadPageData();
  },
});
