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
      <Title title="活動花絮管理"></Title>
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
              <span>{{ scope.row.releaseDate }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="150px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="250px" :label="'概要'">
            <template slot-scope="scope">
              <span>{{ scope.row.summary }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'排序'">
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
              >
                編輯
              </el-button>
              <el-button
                size="mini"
                type="info"
                @click="addImage(scope.row.id)"
              >
                新增相片
              </el-button>
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
            placeholder="請選擇日期"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'概要'" prop="summary">
          <el-input
            type="textarea"
            v-model="temp.summary"
            :autosize="{ minRows: 2 }"
            placeholder="請輸入概要"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'排序'" prop="sort">
          <el-input
            v-model="temp.sort"
            placeholder="請輸入排序（預設：999）"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="addAward" v-if="modalTitle == '新增'">
          確認
        </el-button>
        <el-button type="primary" @click="editAward" v-else>確認</el-button>
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
        <el-button type="primary" @click="delAward">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as departmentAlbem from "@/api/departmentAlbem";
// import * as fileUpload from "@/api/files";

export default {
  name: "award",
  components: { Sticky, Title, permissionBtn, Pagination },
  data() {
    return {
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      total: 10,
      listLoading: false,
      listQuery: {
        TypeId: "SYS_ACTALBUM_ACTIVITY",
        Years: "",
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        albumTypeId: "",
        albumTypeName: "",
        title: "",
        summary: "",
        sort: 999,
        releaseDate: "",
      },
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectLIstId: "",
      selectLIstCount: "",
      rules: {
        releaseDate: [
          {
            required: true,
            message: "公告日期不能為空",
            trigger: "blur",
          },
        ],
        title: [
          {
            required: true,
            message: "標題不能為空",
            trigger: "blur",
          },
        ],
        summary: [
          {
            required: true,
            message: "概要不能為空",
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
      departmentAlbem.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },
    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          this.temp = {
            albumTypeId: "SYS_ACTALBUM_ACTIVITY",
            albumTypeName: "活動花絮",
          };
          this.modalTitle = "新增";
          this.temp.sort = "999";
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
      departmentAlbem.getAlbums({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.openModal = true;
    },
    addImage(albumId) {
      this.$router.push("/highlight/add/" + albumId);
    },
    handleSelectionChange(data) {
      this.selectListId = data.map((res) => res.id);
      this.selectLIstCount = data.length;
    },
    handleCurrentChange() {},
    addAward() {
      const vm = this;
      vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentAlbem.addAlbums(vm.temp).then((res) => {
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
    editAward() {
      const vm = this;
      vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          console.log(vm.temp);
          departmentAlbem.updateAlbums(vm.temp).then((res) => {
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
    delAward() {
      const vm = this;
      departmentAlbem.delAlbums(vm.selectListId).then((res) => {
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

<style lang="scss">
</style>