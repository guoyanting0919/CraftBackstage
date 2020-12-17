<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <permission-btn
          size="mini"
          moduleName="modulemanager"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="教學設備與空間管理"></Title>
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
          <el-table-column min-width="80px" :label="'姓名'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'聯絡電話'">
            <template slot-scope="scope">
              <span>{{ scope.row.contactTel }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'E-mail'">
            <template slot-scope="scope">
              <span>{{ scope.row.email }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.memberTypeName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'職稱'">
            <template slot-scope="scope">
              <span>{{ scope.row.jobTitle }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'授課領域'">
            <template slot-scope="scope">
              <span>{{ scope.row.teachClass }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'研究專長'">
            <template slot-scope="scope">
              <span>{{ scope.row.research }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'排序'">
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
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as member from "@/api/member";

export default {
  name: "member",
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
      console.log(domId);
      return this.buttons.includes(domId);
    },

    /* 獲取成員資料 */
    getList() {
      const vm = this;
      member.getList(vm.listQuery).then((res) => {
        console.log(res);
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    /* 獲取最新消息類別 */
    // getType() {
    //   const vm = this;
    //   let params = {
    //     TypeId: "SYS_NEWS",
    //     limit: 999,
    //   };
    //   categorys.getList(params).then((res) => {
    //     vm.typeList = res.data;
    //   });
    // },
    onBtnClicked(domId) {
      this.$cl(domId);
    },
    rowClick() {},
    handleEdit() {},
    handleSelectionChange() {},
    handleCurrentChange() {},
  },
  mounted() {
    this.getButtons();
    this.getList();
    // this.getType();
  },
};
</script>

<style>
</style>