// pages/books/books.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    books: [],
    filteredBooks: [],
    searchKeyword: "",
    loading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadBooks();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadBooks();
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

  // 加载书籍列表
  loadBooks: function () {
    const books = wx.getStorageSync("books") || [];
    const notes = wx.getStorageSync("notes") || [];

    // 为每本书计算笔记数量和最后更新时间
    const booksWithStats = books.map((book) => {
      const bookNotes = notes.filter((note) => note.bookId === book.id);
      const noteCount = bookNotes.length;
      const lastNote = bookNotes[0]; // 笔记按时间倒序存储，所以第一条是最新的

      return {
        ...book,
        noteCount,
        lastUpdateTime: lastNote
          ? this.formatTime(new Date(lastNote.createTime))
          : null,
      };
    });

    this.setData({
      books: booksWithStats,
      filteredBooks: booksWithStats,
    });
  },

  // 搜索功能
  onSearchInput: function (e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword,
    });
    this.filterBooks(keyword);
  },

  // 搜索确认
  onSearch: function (e) {
    const keyword = e.detail.value;
    this.filterBooks(keyword);
  },

  // 清除搜索
  onClearSearch: function () {
    this.setData({
      searchKeyword: "",
      filteredBooks: this.data.books,
    });
  },

  // 过滤书籍
  filterBooks: function (keyword) {
    if (!keyword) {
      this.setData({
        filteredBooks: this.data.books,
      });
      return;
    }

    const searchKey = keyword.toLowerCase();
    const filtered = this.data.books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchKey) ||
        book.author.toLowerCase().includes(searchKey)
    );

    this.setData({
      filteredBooks: filtered,
    });
  },

  // 点击书籍卡片
  onBookTap: function (e) {
    const book = e.currentTarget.dataset.book;
    wx.navigateTo({
      url: `/pages/book/detail/detail?id=${book.id}`,
    });
  },

  // 添加新书
  onAddBook: function () {
    wx.navigateTo({
      url: "/pages/book/add/add",
      events: {
        // 监听新书添加成功事件
        bookAdded: () => {
          this.loadBooks();
        },
      },
    });
  },

  // 加载更多（预留）
  onLoadMore: function () {
    // 目前所有数据都在本地，暂不需要分页加载
    // 如果后续接入服务器，可以在这里实现分页加载逻辑
  },

  // 格式化时间
  formatTime: function (date) {
    const now = new Date();
    const diff = now - date;
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;

    if (diff < minute) {
      return "刚刚";
    } else if (diff < hour) {
      return Math.floor(diff / minute) + "分钟前";
    } else if (diff < day) {
      return Math.floor(diff / hour) + "小时前";
    } else if (diff < day * 30) {
      return Math.floor(diff / day) + "天前";
    } else {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}/${month}/${day}`;
    }
  },
});
