const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    selectedBook: null,
    showBookList: false,
    canSave: false,
    statusBarHeight: 0,
    books: [],
    showEmptyTip: false,
    isRecording: false,
    recordTime: "00:00",
    recordings: [],
  },

  onLoad: function () {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });

    // 从本地存储加载书籍列表
    this.loadBooks();

    // 初始化录音管理器
    this.initRecorder();
    // 初始化音频播放器
    this.initAudioPlayer();
  },

  onUnload: function () {
    // 停止所有音频播放
    innerAudioContext.stop();
  },

  // 加载书籍列表
  loadBooks: function () {
    const books = wx.getStorageSync("books") || [];
    this.setData({
      books,
      showEmptyTip: books.length === 0,
    });
  },

  // 初始化录音管理器
  initRecorder: function () {
    // 监听录音开始事件
    recorderManager.onStart(() => {
      this.setData({
        isRecording: true,
      });
      this.startTimer();
    });

    // 监听录音结束事件
    recorderManager.onStop((res) => {
      this.setData({
        isRecording: false,
      });
      this.stopTimer();

      // 添加录音到列表
      const { tempFilePath, duration } = res;
      const recordings = [...this.data.recordings];
      recordings.push({
        id: Date.now().toString(),
        path: tempFilePath,
        duration: Math.round(duration / 1000),
        timeStr: new Date().toLocaleTimeString(),
        isPlaying: false,
      });

      this.setData({
        recordings,
        canSave: recordings.length > 0 && this.data.selectedBook,
      });
    });

    // 监听录音错误事件
    recorderManager.onError((error) => {
      console.error("录音错误:", error);
      wx.showToast({
        title: "录音失败",
        icon: "none",
      });
    });
  },

  // 初始化音频播放器
  initAudioPlayer: function () {
    // 监听播放结束事件
    innerAudioContext.onEnded(() => {
      const recordings = this.data.recordings.map((item) => ({
        ...item,
        isPlaying: false,
      }));
      this.setData({ recordings });
    });

    // 监听播放错误事件
    innerAudioContext.onError((error) => {
      console.error("播放错误:", error);
      wx.showToast({
        title: "播放失败",
        icon: "none",
      });
    });
  },

  // 开始录音
  startRecording: function () {
    if (!this.data.selectedBook) {
      wx.showToast({
        title: "请先选择书籍",
        icon: "none",
      });
      return;
    }

    const options = {
      duration: 600000, // 最长10分钟
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: "mp3",
    };

    recorderManager.start(options);
  },

  // 停止录音
  stopRecording: function () {
    if (this.data.isRecording) {
      recorderManager.stop();
    }
  },

  // 计时器
  startTimer: function () {
    this.recordStartTime = Date.now();
    this.timer = setInterval(() => {
      const duration = Math.floor((Date.now() - this.recordStartTime) / 1000);
      const minutes = Math.floor(duration / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (duration % 60).toString().padStart(2, "0");
      this.setData({
        recordTime: `${minutes}:${seconds}`,
      });
    }, 1000);
  },

  stopTimer: function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setData({
      recordTime: "00:00",
    });
  },

  // 播放录音
  playRecording: function (e) {
    const { id } = e.currentTarget.dataset;
    const recordings = this.data.recordings.map((item) => ({
      ...item,
      isPlaying: item.id === id,
    }));

    this.setData({ recordings });

    const recording = recordings.find((item) => item.id === id);
    innerAudioContext.src = recording.path;
    innerAudioContext.play();
  },

  // 暂停播放
  pauseRecording: function (e) {
    const { id } = e.currentTarget.dataset;
    const recordings = this.data.recordings.map((item) => ({
      ...item,
      isPlaying: false,
    }));

    this.setData({ recordings });
    innerAudioContext.pause();
  },

  // 删除录音
  deleteRecording: function (e) {
    const { id } = e.currentTarget.dataset;
    const recordings = this.data.recordings.filter((item) => item.id !== id);

    this.setData({
      recordings,
      canSave: recordings.length > 0 && this.data.selectedBook,
    });

    if (recordings.length === 0) {
      innerAudioContext.stop();
    }
  },

  // 处理返回按钮点击
  onBackTap: function () {
    if (this.data.recordings.length > 0) {
      wx.showModal({
        title: "提示",
        content: "是否保存当前录音？",
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
      canSave: this.data.recordings.length > 0,
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
            canSave: this.data.recordings.length > 0,
          });
          wx.setStorageSync("books", books);
        },
      },
    });
  },

  onSave: function () {
    if (!this.data.canSave) return;

    const note = {
      id: Date.now().toString(),
      bookId: this.data.selectedBook.id,
      type: "voice",
      recordings: this.data.recordings,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    // 保存笔记到本地存储
    const notes = wx.getStorageSync("notes") || [];
    notes.unshift(note);
    wx.setStorageSync("notes", notes);

    wx.showToast({
      title: "保存成功",
      icon: "success",
      duration: 2000,
    });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 2000);
  },
});
