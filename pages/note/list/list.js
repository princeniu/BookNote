Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    books: [],
    notes: [],
    filteredNotes: [],
    searchKeyword: "",
    currentBookId: "",
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

    // 加载数据
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadData();
  },

  // 加载数据
  loadData: function () {
    const books = wx.getStorageSync("books") || [];
    const notes = wx.getStorageSync("notes") || [];

    // 为笔记添加书籍信息和格式化时间
    const notesWithBooks = notes.map((note) => {
      const book = books.find((book) => book.id === note.bookId) || {
        title: "未知书籍",
        coverUrl: "/assets/images/default-cover.png",
      };
      return {
        ...note,
        book,
        createTimeFormatted: this.formatTime(new Date(note.createTime)),
      };
    });

    this.setData({
      books,
      notes: notesWithBooks,
    });

    // 应用当前的筛选条件
    this.filterNotes();
  },

  // 搜索输入
  onSearchInput: function (e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword,
    });
    this.filterNotes();
  },

  // 清除搜索
  onClearSearch: function () {
    this.setData({
      searchKeyword: "",
    });
    this.filterNotes();
  },

  // 点击标签
  onTagTap: function (e) {
    const bookId = e.currentTarget.dataset.id;
    this.setData({
      currentBookId: bookId,
    });
    this.filterNotes();
  },

  // 筛选笔记
  filterNotes: function () {
    let filtered = [...this.data.notes];

    // 按书籍筛选
    if (this.data.currentBookId) {
      filtered = filtered.filter(
        (note) => note.bookId === this.data.currentBookId
      );
    }

    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(keyword) ||
          note.book.title.toLowerCase().includes(keyword)
      );
    }

    this.setData({
      filteredNotes: filtered,
    });
  },

  // 点击笔记
  onNoteTap: function (e) {
    const note = e.currentTarget.dataset.note;
    wx.navigateTo({
      url: `/pages/note/detail/detail?id=${note.id}`,
    });
  },

  // 添加笔记
  onAddNote: function () {
    wx.navigateTo({
      url: "/pages/note/text/text",
    });
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack();
  },

  // 加载更多
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
