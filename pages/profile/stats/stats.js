Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentDate: "",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    stats: {
      totalBooks: 0,
      totalNotes: 0,
      totalDays: 0,
      averageNotesPerDay: "0.0",
    },
    monthlyStats: {
      days: 0,
      notes: 0,
      books: 0,
    },
    heatmapData: [],
    bookRanking: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const now = new Date();

    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
    });

    // 加载统计数据
    this.loadStats();
  },

  // 加载统计数据
  loadStats: function () {
    const books = wx.getStorageSync("books") || [];
    const notes = wx.getStorageSync("notes") || [];

    // 计算总体统计
    const days = new Set();
    notes.forEach((note) => {
      const date = new Date(note.createTime).toDateString();
      days.add(date);
    });

    const stats = {
      totalBooks: books.length,
      totalNotes: notes.length,
      totalDays: days.size,
      averageNotesPerDay: days.size
        ? (notes.length / days.size).toFixed(1)
        : "0.0",
    };

    // 计算月度统计
    const currentYear = this.data.currentYear;
    const currentMonth = this.data.currentMonth;
    const monthlyNotes = notes.filter((note) => {
      const date = new Date(note.createTime);
      return (
        date.getFullYear() === currentYear &&
        date.getMonth() + 1 === currentMonth
      );
    });

    const monthlyDays = new Set();
    const monthlyBooks = new Set();
    monthlyNotes.forEach((note) => {
      const date = new Date(note.createTime).toDateString();
      monthlyDays.add(date);
      monthlyBooks.add(note.bookId);
    });

    const monthlyStats = {
      days: monthlyDays.size,
      notes: monthlyNotes.length,
      books: monthlyBooks.size,
    };

    // 生成热力图数据
    const heatmapData = this.generateHeatmapData(notes);

    // 生成书籍排行
    const bookRanking = this.generateBookRanking(books, notes);

    this.setData({
      stats,
      monthlyStats,
      heatmapData,
      bookRanking,
    });
  },

  // 生成热力图数据
  generateHeatmapData: function (notes) {
    const currentYear = this.data.currentYear;
    const currentMonth = this.data.currentMonth;

    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);

    // 统计每天的笔记数量
    const dailyCounts = {};
    notes.forEach((note) => {
      const date = new Date(note.createTime);
      if (
        date.getFullYear() === currentYear &&
        date.getMonth() + 1 === currentMonth
      ) {
        const day = date.getDate();
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      }
    });

    // 创建日历网格（按周分组）
    const calendar = [];
    const totalDays = lastDay.getDate();
    const firstDayWeekday = firstDay.getDay(); // 0-6, 0 is Sunday

    // 计算需要多少周来显示整个月
    const totalWeeks = Math.ceil((totalDays + firstDayWeekday) / 7);

    // 为每周创建一个数组
    for (let week = 0; week < totalWeeks; week++) {
      const weekData = [];

      for (let weekday = 0; weekday < 7; weekday++) {
        const dayNumber = week * 7 + weekday - firstDayWeekday + 1;

        if (dayNumber < 1 || dayNumber > totalDays) {
          // 不在当月范围内的日期
          weekData.push({ date: "", count: 0, level: 0 });
        } else {
          // 当月的有效日期
          const count = dailyCounts[dayNumber] || 0;
          const level = count === 0 ? 0 : Math.min(Math.ceil(count / 2), 5);
          weekData.push({
            date: `${currentMonth}月${dayNumber}日`,
            count,
            level,
          });
        }
      }

      calendar.push(weekData);
    }

    return calendar;
  },

  // 生成书籍排行
  generateBookRanking: function (books, notes) {
    // 统计每本书的笔记数量
    const bookNotes = {};
    notes.forEach((note) => {
      bookNotes[note.bookId] = (bookNotes[note.bookId] || 0) + 1;
    });

    // 为书籍添加笔记数量并排序
    const ranking = books
      .map((book) => ({
        ...book,
        noteCount: bookNotes[book.id] || 0,
      }))
      .sort((a, b) => b.noteCount - a.noteCount)
      .slice(0, 5); // 只显示前5名

    return ranking;
  },

  // 月份选择改变
  onMonthChange: function (e) {
    const [year, month] = e.detail.value.split("-").map(Number);

    this.setData({
      currentYear: year,
      currentMonth: month,
      currentDate: e.detail.value,
    });

    this.loadStats();
  },

  // 点击书籍
  onBookTap: function (e) {
    const book = e.currentTarget.dataset.book;
    wx.navigateTo({
      url: `/pages/book/detail/detail?id=${book.id}`,
    });
  },

  // 返回上一页
  onBackTap: function () {
    wx.navigateBack();
  },

  // 格式化日期为YYYY-MM
  formatDate: function (date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  },
});
