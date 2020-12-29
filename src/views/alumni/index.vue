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
      <Title title="系友專區管理"></Title>
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
          <el-table-column min-width="100px" :label="'公告日期'">
            <template slot-scope="scope">
              <span>{{ scope.row.releaseDate | moment("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="200px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'得獎學生'">
            <template slot-scope="scope">
              <span>{{ scope.row.author }}</span>
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
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="30%">
      <el-form
        :rules="rules"
        ref="dataForm"
        :model="temp"
        label-position="right"
        label-width="100px"
      >
        <el-form-item size="small" :label="'公告日期'" prop="releaseDate">
          <el-date-picker
            class="fw"
            v-model="temp.releaseDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="請選擇公告日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'得獎學生'" prop="author">
          <el-input
            v-model="temp.author"
            placeholder="請輸入得獎學生"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button
          type="primary"
          @click="addAlumnis"
          v-if="modalTitle == '新增'"
        >
          確認
        </el-button>
        <el-button type="primary" @click="editAlumnis" v-else>確認</el-button>
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
        <el-button type="primary" @click="delAlumnis">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as departmentAlumnis from "@/api/departmentAlumnis";

export default {
  name: "departmentAlumnis",
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
      temp: {
        id: "",
        title: "",
        releaseDate: "",
        author: "",
        contents: "",
        annexFile: "",
      },
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectLIstId: "",
      selectLIstCount: "",
      rules: {
        title: [
          {
            required: true,
            message: "姓名不能為空",
            trigger: "blur",
          },
        ],
        releaseDate: [
          {
            required: true,
            message: "聯絡電話不能為空",
            trigger: "blur",
          },
        ],
        author: [
          {
            required: true,
            message: "聯絡電話不能為空",
            trigger: "blur",
          },
        ],
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

    /* 獲取成員資料 */
    getList() {
      const vm = this;
      departmentAlumnis.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          this.temp = {};
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
      departmentAlumnis.getAlumnis({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.openModal = true;
    },
    handleSelectionChange(data) {
      this.selectListId = data.map((res) => res.id);
      this.selectLIstCount = data.length;
    },
    handleCurrentChange() {},
    addAlumnis() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentAlumnis.addAlumnis(vm.temp).then((res) => {
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
    editAlumnis() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentAlumnis.updateAlumnis(vm.temp).then((res) => {
            console.log(res);
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
    delAlumnis() {
      const vm = this;
      departmentAlumnis.delAlumnis(vm.selectListId).then((res) => {
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
  },
};
</script>

<style>
</style>