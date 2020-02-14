<style lang="scss" scoped>
div.wrapper {
  background: whitesmoke;
  height: 100vh;
  padding-top: 60px;
}

div.searcher {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;

  background-color: white;
  border-bottom: 1px solid lightgrey;
  display: flex;
  align-items: center;

  &.disabled {
    background-color: rgba(211, 211, 211, 0.7);
  }

  & > input {
    display: inline-block;
    outline: none;
    border: 0;
    width: 90%;
    padding: 15px 20px;
    font-size: 120%;

    &:disabled {
      background-color: transparent !important;
    }
  }

  & > button {
    text-align: right;
    display: inline-block;
    align-items: center;
    width: 9%;
    top: 15px;
    background: transparent;
    outline: none;
    border: 0;
    cursor: pointer;
    opacity: 0.6;
    &:hover {
      opacity: 1;
    }
  }
}

div.results {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: whitesmoke;

  & > div.result {
    padding: 15px 20px;
    border-bottom: 1px solid lightgrey;

    &:last-of-type {
      border-bottom: 0;
    }

    & > div.buttons {
      transform: translateX(100px);
      float: right;
      
      & > i {
        display: inline-block;
        cursor: pointer;
      }

      & > i + i {
        margin-left: 10px;
      }
    }

    &:hover > div.buttons {
      transform: translateX(0px);
      transition: transform 0.5s;
    }
  }
}
</style>

<style>
span.hightlight {
  display: inline-block;
  background-color: cyan;
}
</style>

<template>
  <div class="wrapper">
    <div class="searcher" :class="{ 'disabled': loading }">
      <input
        :disabled="loading"
        v-model="search"
        type="text"
        placeholder="Search files or folders..."
        autofocus
        @keypress.enter="handleSearch"
      />
      <button class="fa-lg">
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <i v-if="!loading && search != ''" class="fas fa-times-circle" @click="clear"></i>
      </button>
    </div>

    <div>
      <small style="display: block; padding: 5px 20px; color: grey; background-color: whitesmoke;">
        Searching on
        <small style="color: black">{{ basePath }}</small>
        <i class="fas fa-cog fa-fw fa-sm" style="cursor: pointer;" @click="changeBasePath"></i>
      </small>

      <span v-if="results.lenght == 0">Nothing to show yet...</span>

      <div class="results">
        <div class="result" v-for="item in results" :key="item">
          <span v-html="highlightText(item)" />

          <div class="buttons">
            <i class="fas fa-external-link-alt" @click="open(item)"></i>
            <i class="far fa-folder-open" @click="openOnFolder(item)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "landing-page",
  data() {
    return {
      search: "",
      basePath: "/home/gabpc",
      loading: false,
      results: []
    };
  },
  mounted() {
    this.$electron.ipcRenderer.send("fs-last-results");

    this.$electron.ipcRenderer.on("fs-last-results-response", (event, arg) => {
      this.search = arg.search;
      this.results = arg.response;
    });
  },
  methods: {
    highlightText(text) {
      return text
        .replace(this.basePath + "/", "")
        .split(this.search)
        .join(`<span class="hightlight">${this.search}</span>`);
    },
    clear() {
      this.search = "";
      this.results = [];
    },
    handleSearch() {
      if (this.search == "") return;

      this.results = [];
      this.loading = true;

      this.$electron.ipcRenderer.on("fs-search-response", (event, arg) => {
        this.loading = false;
        this.results = arg;
      });

      this.$electron.ipcRenderer.send("fs-search", {
        path: this.basePath,
        search: this.search
      });
    },
    changeBasePath() {},
    open(link) {
      this.$electron.shell.openItem(link);
    },
    openOnFolder(link) {
      this.$electron.shell.showItemInFolder(link);
    }
  }
};
</script>