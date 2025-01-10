// index.js
Page({
  data: {
    selectedBook: null,
    noteContent: "",
    showBookList: false,
    canSave: false,
    statusBarHeight: 0,
    recentBooks: [],
  },

  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });
  },

  // 每次页面显示时重新加载数据
  onShow: function () {
    this.loadRecentBooks();
  },

  // 加载最近的书籍
  loadRecentBooks: function () {
    const books = wx.getStorageSync("books") || [];
    // 只显示最近的5本书
    const recentBooks = books.slice(0, 5);
    this.setData({ recentBooks });
  },

  // 点击文字笔记入口
  onTextNoteTap: function () {
    wx.navigateTo({
      url: "/pages/note/text/text",
      fail: function (error) {
        console.error("导航到文字笔记页失败：", error);
        wx.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  },

  // 点击语音笔记入口
  onVoiceNoteTap: function () {
    wx.navigateTo({
      url: "/pages/note/voice/voice",
      fail: function (error) {
        console.error("导航到语音笔记页失败：", error);
        wx.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  },

  onContentInput: function (e) {
    const content = e.detail.value;
    this.setData({
      noteContent: content,
      canSave: content.trim().length > 0 && this.data.selectedBook,
    });
  },

  onSelectBook: function () {
    this.setData({ showBookList: true });
  },

  onChangeBook: function () {
    this.setData({ showBookList: true });
  },

  onClosePopup: function () {
    this.setData({ showBookList: false });
  },

  stopPropagation: function () {
    // 阻止事件冒泡
  },

  onBookSelect: function (e) {
    const book = e.currentTarget.dataset.book;
    this.setData({
      selectedBook: book,
      showBookList: false,
      canSave: this.data.noteContent.trim().length > 0,
    });
  },

  onAddBook: function () {
    wx.navigateTo({
      url: "/pages/book/add/add",
      events: {
        // 监听新书添加成功事件
        bookAdded: (book) => {
          // 更新最近书籍列表
          const recentBooks = [book, ...this.data.recentBooks].slice(0, 5);
          this.setData({
            recentBooks,
            selectedBook: book,
            showBookList: false,
            canSave: this.data.noteContent.trim().length > 0,
          });
        },
      },
    });
  },

  onBookTap: function (e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/book/detail/detail?id=${bookId}`,
      fail: function (error) {
        console.error("导航到书籍详情页失败：", error);
        wx.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  },

  onViewMoreTap: function () {
    wx.switchTab({
      url: "/pages/books/books",
      fail: function (error) {
        console.error("切换到图书页面失败：", error);
        wx.showToast({
          title: "页面切换失败",
          icon: "none",
        });
      },
    });
  },

  onSave: function () {
    if (!this.data.canSave) return;

    const note = {
      id: Date.now(),
      bookId: this.data.selectedBook.id,
      content: this.data.noteContent,
      createTime: new Date().toISOString(),
    };

    // 保存笔记到本地存储
    const notes = wx.getStorageSync("notes") || [];
    notes.unshift(note);
    wx.setStorageSync("notes", notes);

    // 跳转到笔记详情页
    wx.navigateTo({
      url: `/pages/note/detail/detail?id=${note.id}`,
      success: () => {
        // 返回上一页
        wx.navigateBack();
      },
    });
  },
});
