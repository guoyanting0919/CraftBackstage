<template>
  <div class="flex-column">
    <div class="app-container flex-item">
      <Title title="研討會管理"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-tabs v-model="activeTabValue" tab-position="right" style="height: 100%" @tab-click="changeTab">
          <el-tab-pane :label="item.label" :name="item.label" v-for="item in tabData" :key="item.id">
            <div class="tabContent">
              <div class="tabContent__header">
                <strong>內容</strong>
                <div>
                  <el-button size="mini" type="primary" @click="handleAdd()" v-if="item.value=='news'" plain>新增</el-button>
                  <el-button size="mini" type="warning" @click="handleSeminarEdit(list[0].id)" v-if="hasButton('edit') && item.value !== 'news'">編輯</el-button>
                  <el-button size="mini" type="danger" @click="handleDel()" v-if="item.value=='news'" plain>刪除</el-button>
                </div>
              </div>
              <el-divider></el-divider>
              <el-table ref="mainTable" :data="newsList" v-loading="listLoading" border fit highlight-current-row style="width: 100%;" height="calc(100% - 52px)" @selection-change="handleSelectionChange" v-if="item.value == 'news'">
                <el-table-column align="center" type="selection" width="55"></el-table-column>
                <el-table-column min-width="100px" :label="'公告日期'">
                  <template slot-scope="scope">
                    <span>{{ scope.row.releaseDate | moment("YYYY-MM-DD") }}</span>
                  </template>
                </el-table-column>
                <el-table-column min-width="200px" label="標題">
                  <template slot-scope="scope">
                    <span>{{ scope.row.title }}</span>
                  </template>
                </el-table-column>
                <el-table-column min-width="100px" label="副標題">
                  <template slot-scope="scope">
                    <span>{{ scope.row.summury }}</span>
                  </template>
                </el-table-column>
                <el-table-column min-width="80px" label="上傳檔案">
                  <template slot-scope="scope">
                    <span>{{ scope.row.attachedFile ? '是' : '否' }}</span>
                  </template>
                </el-table-column>
                <el-table-column min-width="80px" label="排序">
                  <template slot-scope="scope">
                    <span>{{ scope.row.sort }}</span>
                  </template>
                </el-table-column>
                <el-table-column property="setting" label="操作" width="150">
                  <template slot-scope="scope">
                    <el-button size="mini" type="warning" @click="handleEdit(scope.row)" v-if="hasButton('edit')">編輯</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div v-else>
                <ckeditor class="disEditor" :value="list[0].contents" :config="setConfig" />
              </div>

              <!-- <div v-else>
                <vue-editor v-model="list[0].contents" />
              </div> -->
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- modal -->
    <!-- add & edit -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="60%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'公告日期'" prop="releaseDate">
          <el-date-picker class="fw" v-model="temp.releaseDate" type="date" value-format="yyyy-MM-dd" :picker-options="disBeforeTime" placeholder="請選擇公告日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'副標題'">
          <el-input v-model="temp.summury" placeholder="請輸入副標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'內容'" prop="contents">
          <vue-editor v-model="temp.contents" />
        </el-form-item>
        <el-form-item size="small" :label="'檔案上傳'" prop="attachedFile">
          <el-upload ref="imageUpload" :show-file-list="false" accept="" class="upload-demo" action="" :http-request="customUpload" :limit="999">
            <el-button size="small" type="primary">上傳</el-button>
          </el-upload>
          <div class="fw flex-row">
            <p class="m-0 pr-10" v-for="item in groupFile" :key="item.id">
              {{ item.fileName }}
            </p>
          </div>
        </el-form-item>
        <el-form-item size="small" :label="'排序'">
          <el-input v-model="temp.sort" placeholder="請輸入排序（預設：999）"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="addNews" v-if="modalTitle == '新增'">
          確認
        </el-button>
        <el-button type="primary" @click="editNews" v-else>確認</el-button>
      </span>
    </el-dialog>

    <!-- delete -->
    <el-dialog title="刪除" :visible.sync="delModal" width="20%">
      <div class="fw">
        <strong class="font-s-18">確定要刪除這 {{ selectLIstCount }}筆 資料嗎？
        </strong>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delModal = false">取消</el-button>
        <el-button type="primary" @click="delNews">確認</el-button>
      </span>
    </el-dialog>

    <!-- seminar edit -->
    <el-dialog :title="'編輯－' + activeTabValue" :visible.sync="openSeminarModal" width="60%">
      <el-form :rules="rules_seminar" ref="dataForm_seminar" :model="temp_seminar" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'內容'" prop="contents">
          <ckeditor :value="temp_seminar.contents" v-model="temp_seminar.contents" />
          <!-- <vue-editor v-model="temp_seminar.contents" /> -->
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openSeminarModal = false">取消</el-button>
        <el-button type="primary" @click="editSeminar">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Title from "@/components/ConsoleTableTitle";

import * as seminarWorks from "@/api/seminarWork";
import * as seminarNews from "@/api/seminarNews";

export default {
  name: "seminarWorks",
  components: { Title },
  data() {
    return {
      setConfig: {
        readOnly: true,
        extraPlugins: "button,panelbutton,colorbutton",
      },
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      newsList: [],
      total: 10,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
      },
      newsListQuery: {
        NewsTypeId: "",
        page: 1,
        limit: 999,
        key: undefined,
      },
      temp: {
        id: "",
        newsTypeId: "",
        newsTypeName: "",
        releaseDate: "",
        title: "",
        summury: "",
        contents: "",
        attachedFile: "",
        sort: "",
      },
      temp_seminar: {
        id: "",
        contents: "",
      },
      tabData: [
        { id: 1, label: "最新消息", value: "news" },
        { id: 2, label: "與會方式", value: "method" },
        { id: 3, label: "徵稿須知", value: "notice" },
        { id: 4, label: "活動主旨", value: "actSubject" },
        { id: 5, label: "活動議程", value: "actAgenda" },
        { id: 6, label: "聯絡資訊", value: "info" },
        { id: 7, label: "審稿規範", value: "rules" },
      ],
      rules: {
        title: [
          {
            required: true,
            message: "標題不能為空",
            trigger: "blur",
          },
        ],
        contents: [
          {
            required: true,
            message: "內容不能為空",
            trigger: "blur",
          },
        ],
        releaseDate: [
          {
            required: true,
            message: "公告日期不能為空",
            trigger: "blur",
          },
        ],
      },
      rules_seminar: {
        contents: [
          {
            required: true,
            message: "內容不能為空",
            trigger: "blur",
          },
        ],
      },
      activeTabValue: "活動主旨",
      modalTitle: "",
      openModal: false,
      openSeminarModal: false,
      delModal: false,
      selectListId: [],
      selectLIstCount: "",
      groupFile: [],
      fileInfo: {},
      disBeforeTime: {
        disabledDate(date) {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        },
      },
    };
  },
  methods: {
    /* 獲取本路由下所有功能按鈕 */
    getButtons() {
      this.$route.meta.elements.forEach((el) => {
        this.buttons.push(el.domId);
      });
    },
    /* 是否擁有按鈕功能權限 */
    hasButton(domId) {
      return this.buttons.includes(domId);
    },
    /* 獲取資料 */
    getNewsList() {
      const vm = this;
      seminarNews.getList(vm.newsListQuery).then((res) => {
        vm.newsList = res.data;
      });
    },
    getList() {
      const vm = this;
      seminarWorks.getList(vm.listQuery).then((res) => {
        vm.list = res.data.filter((data) => data.typeName == vm.activeTabValue);
      });
    },
    changeTab(item) {
      if (item.name == "最新消息") {
        console.log(111);
      } else {
        this.getList();
      }
    },

    /* 最新消息中控按鈕 */
    handleAdd() {
      const vm = this;
      vm.modalTitle = "新增";
      vm.groupFile = [];
      vm.temp.sort = 999;
      vm.openModal = true;
    },
    handleEdit(data) {
      seminarNews.getSeminarNews({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.groupFile = [];
      this.openModal = true;
    },
    handleDel() {
      const vm = this;
      if (vm.selectLIstCount > 0) {
        vm.delModal = true;
      } else {
        vm.$notify({
          title: "錯誤",
          message: "請先選擇欲刪除之項目！",
          type: "error",
          duration: 2000,
        });
      }
    },
    /* 編輯 */
    handleSeminarEdit(id) {
      const vm = this;
      seminarWorks.getSeminarWorks({ id: id }).then((res) => {
        vm.temp_seminar = Object.assign({}, res.result);
      });
      vm.openSeminarModal = true;
    },

    handleSelectionChange(data) {
      this.selectListId = data.map((res) => res.id);
      this.selectLIstCount = data.length;
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    customUpload(file) {
      const vm = this;
      let formData = new FormData();
      formData.append("files", file.file, file.file.name);
      axios
        .post(`${process.env.VUE_APP_BASE_API}Files/Upload`, formData)
        .then((response) => {
          vm.fileInfo = response.data.result[0];
          let getFile = {
            id: vm.fileInfo.id,
            fileName: vm.fileInfo.fileName,
            files: "http://140.131.21.65/" + vm.fileInfo.filePath,
          };
          vm.groupFile.push(getFile);
          vm.temp.attachedFile = JSON.stringify(vm.groupFile);
        })
        .catch((error) => {
          console.log({ error });
        });
    },

    /* 新增、修改、刪除 最新消息 */
    addNews() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          seminarNews.addSeminarNews(vm.temp).then((res) => {
            if (res.code === 200) {
              vm.$notify({
                title: "成功",
                message: "新增成功",
                type: "success",
                duration: 2000,
              });
              vm.openModal = false;
              vm.getNewsList();
            }
          });
        }
      });
    },
    editNews() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          seminarNews.updateSeminarNews(vm.temp).then((res) => {
            if (res.code === 200) {
              vm.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000,
              });
              this.openModal = false;
              this.getNewsList();
            }
          });
        }
      });
    },
    delNews() {
      const vm = this;
      seminarNews.delSeminarNews(vm.selectListId).then((res) => {
        if (res.code === 200) {
          vm.$notify({
            title: "成功",
            message: "刪除成功",
            type: "success",
            duration: 2000,
          });
          vm.delModal = false;
          vm.getNewsList();
        }
      });
    },
    /*  */
    editSeminar() {
      const vm = this;
      vm.$refs["dataForm_seminar"].validate((valid) => {
        if (valid) {
          seminarWorks.updateSeminarWorks(vm.temp_seminar).then((res) => {
            if (res.code === 200) {
              vm.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000,
              });
              this.openSeminarModal = false;
              this.getList();
            }
          });
        }
      });
    },
  },
  mounted() {
    this.getButtons();
    this.getNewsList();
    this.getList();
  },
};
</script>

<style lang="scss">
.tabContent {
  padding: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .el-divider {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .ql-editor {
    min-height: 100px;
  }

  .ql-toolbar {
    display: none !important;
  }

  .ql-container {
    border: none !important;
    ol {
      padding-left: 0;
    }
  }

  .disEditor {
    .cke {
      &_contents {
        min-height: calc(100vh - 210px);
      }

      &_top,
      &_bottom {
        display: none !important;
      }
    }
  }
}
</style>