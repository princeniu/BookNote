Page({
  data: {
    selectedBook: null,
    noteContent: "",
    showBookList: false,
    canSave: false,
    statusBarHeight: 0,
    books: [],
    showEmptyTip: false,
  },

  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });

    // 从本地存储加载书籍列表
    this.loadBooks();
  },

  // 加载书籍列表
  loadBooks: function () {
    const books = wx.getStorageSync("books") || [];
    this.setData({
      books,
      showEmptyTip: books.length === 0,
    });
  },

  // 处理返回按钮点击
  onBackTap: function () {
    if (this.data.noteContent.trim().length > 0) {
      wx.showModal({
        title: "提示",
        content: "是否保存当前笔记？",
        confirmText: "保存",
        cancelText: "不保存",
        success: (res) => {
          if (res.confirm && this.data.canSave) {
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
          const books = this.data.books.concat(book);
          this.setData({
            books,
            selectedBook: book,
            showBookList: false,
            canSave: this.data.noteContent.trim().length > 0,
          });
          wx.setStorageSync("books", books);
        },
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
