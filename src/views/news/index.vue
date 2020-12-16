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
          <el-table-column min-width="80px" :label="'名稱'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'年紀'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'生日'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'消息'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'地點'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'時間'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'性別'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
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
      list: [{ name: "aaaa" }], // 菜單列表
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
        releaseDate: "2020-12-16T07:31:15.488Z",
        title: "",
        contents: "",
        attachedFile: "",
        sort: 999,
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
        vm.$cl(res);
      });
    },

    /* 權限按鈕中控 */
    onBtnClicked(domId) {
      this.$cl(domId);
    },
    rowClick() {},
    handleSelectionChange() {},
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
  },
  mounted() {
    this.getButtons();
    this.getList();
    this.getType();
  },
};
</script>

<style>
</style>