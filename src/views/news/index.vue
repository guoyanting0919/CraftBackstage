<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-input
          style="width: 200px; margin-right: 0.5rem"
          size="mini"
          clearable
          placeholder="請輸入關鍵字"
        ></el-input>
        <permission-btn
          size="mini"
          moduleName="modulemanager"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="最新消息管理"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table
          ref="mainTable"
          :data="list"
          v-loading="listLoading"
          border
          fit
          highlight-current-row
          style="width: 100%"
          height="calc(100% - 52px)"
          @row-click="rowClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            align="center"
            type="selection"
            width="55"
          ></el-table-column>
          <el-table-column min-width="80px" :label="'公告日期'">
            <template slot-scope="scope">
              <span>{{ scope.row.releaseDate | moment("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="100px" :label="'副標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.summury }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="250px" :label="'內容'">
            <template slot-scope="scope">
              <span>{{ scope.row.contents }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.newsTypeName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="30px" :label="'排序'">
            <template slot-scope="scope">
              <span>{{ scope.row.sort }}</span>
            </template>
          </el-table-column>
          <el-table-column property="setting" label="操作" width="220">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleEdit(scope.row)"
                v-if="hasButton('edit')"
                >編輯</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="listQuery.page"
          :limit.sync="listQuery.limit"
          @pagination="handleCurrentChange"
        />
      </div>
    </div>

    <!-- modal -->
    <!-- add -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="60%">
      <el-form
        :rules="rules"
        ref="dataForm"
        :model="temp"
        label-position="right"
        label-width="100px"
      >
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'副標題'">
          <el-input
            v-model="temp.summury"
            placeholder="請輸入副標題"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'內容'" prop="contents">
          <vue-editor v-model="temp.contents" />
        </el-form-item>
        <el-form-item size="small" :label="'類別'" prop="newsTypeId">
          <el-select
            v-model="temp.newsTypeId"
            class="fw"
            placeholder="請選擇類別"
            no-match-text="暫無數據"
            @change="getTypeName"
          >
            <el-option
              v-for="item in typeList"
              :key="item.id"
              :label="item.name"
              :value="item.dtValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item size="small" :label="'時間'" prop="releaseDate">
          <el-date-picker
            class="fw"
            v-model="temp.releaseDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="請選擇日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'排序'">
          <el-input
            v-model="temp.sort"
            placeholder="請輸入排序（預設：999）"
          ></el-input>
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
        <strong class="font-s-18"
          >確定要刪除這 {{ selectLIstCount }}筆 資料嗎？
        </strong>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delModal = false">取消</el-button>
        <el-button type="primary" @click="delNews">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as news from "@/api/news";
import * as categorys from "@/api/categorys";

export default {
  name: "news",
  components: { Sticky, Title, permissionBtn, Pagination },
  data() {
    return {
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      total: 10,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
        NewsTypeId: "",
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
      typeList: [],

      openModal: false,
      modalTitle: "",
      delModal: false,
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
        newsTypeId: [
          {
            required: true,
            message: "類別不能為空",
            trigger: "blur",
          },
        ],
        releaseDate: [
          {
            required: true,
            message: "時間不能為空",
            trigger: "blur",
          },
        ],
      },
      selectListId: [],
      selectLIstCount: "",
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

    /* 獲取最新消資料 */
    getList() {
      const vm = this;
      news.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    /* 獲取最新消息類別 */
    getType() {
      const vm = this;
      let params = {
        TypeId: "SYS_NEWS",
        limit: 999,
      };
      categorys.getList(params).then((res) => {
        vm.typeList = res.data;
      });
    },

    /* 權限按鈕中控 */
    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          this.temp = {};
          this.temp.sort = 999;
          this.modalTitle = "新增";
          this.openModal = true;
          break;
        case "delete":
          if (this.selectLIstCount > 0) {
            this.delModal = true;
          } else {
            this.$notify({
              title: "錯誤",
              message: "請先選擇欲刪除之項目！",
              type: "error",
              duration: 2000,
            });
          }
          break;
        default:
          break;
      }
    },
    rowClick() {},
    handleEdit(data) {
      news.getNews({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.openModal = true;
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
    getTypeName(typeId) {
      const vm = this;
      vm.typeList.filter((item) => {
        if (typeId === item.dtValue) {
          vm.temp.newsTypeName = item.name;
        }
      });
    },
    addNews() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          news.addNews(vm.temp).then((res) => {
            if (res.code === 200) {
              vm.$notify({
                title: "成功",
                message: "新增成功",
                type: "success",
                duration: 2000,
              });
              this.openModal = false;
              this.getList();
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
          news.updateNews(vm.temp).then((res) => {
            if (res.code === 200) {
              vm.$notify({
                title: "成功",
                message: "修改成功",
                type: "success",
                duration: 2000,
              });
              this.openModal = false;
              this.getList();
            }
          });
        }
      });
    },
    delNews() {
      const vm = this;
      news.delNews(vm.selectListId).then((res) => {
        if (res.code === 200) {
          vm.$notify({
            title: "成功",
            message: "刪除成功",
            type: "success",
            duration: 2000,
          });
          this.delModal = false;
          this.getList();
        }
      });
    },
  },
  mounted() {
    this.getButtons();
    this.getList();
    this.getType();
  },
};
</script>

<style lang="scss">
.newsModal {
  label {
    width: 80px;
    text-align: right;
  }
}
</style>