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
      <Title title="學制地圖管理"></Title>
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
          <el-table-column min-width="300" :label="'檔案連結'" align="center">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                content="查看檔案"
                placement="bottom"
              >
                <a
                  :href="scope.row.fileLink"
                  :download="scope.row.fileLink"
                  target="_blank"
                >
                  <img
                    src="@/assets/images/link.svg"
                    alt="查看檔案"
                    width="30px"
                  />
                </a>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column min-width="100" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.typeName }}</span>
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
        <el-form-item size="small" :label="'檔案上傳'" prop="fileLink">
          <el-upload
            ref="imageUpload"
            :show-file-list="false"
            accept=""
            class="upload-demo"
            action=""
            :http-request="customUpload"
            :limit="999"
          >
            <el-button size="small" type="primary">上傳</el-button>
            <p class="m-0">{{ fileInfo.fileName }}</p>
          </el-upload>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button
          type="primary"
          @click="addEduMap"
          v-if="modalTitle == '新增'"
        >
          確認
        </el-button>
        <el-button type="primary" @click="editEduMap" v-else>確認</el-button>
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
        <el-button type="primary" @click="delEduMap">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as singleFiles from "@/api/singleFiles";

export default {
  name: "singleFiles",
  components: { Sticky, Title, permissionBtn, Pagination },
  data() {
    return {
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      total: 10,
      listLoading: false,
      listQuery: {
        TypeId: "SYS_SINGLEFILE_MAP",
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        typeId: "",
        typeName: "",
        fileName: "",
        fileLink: "",
      },
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectLIstId: "",
      selectLIstCount: "",
      fileInfo: {},
      rules: {
        fileName: [
          {
            required: true,
            message: "年度不能為空",
            trigger: "blur",
          },
        ],
        typeId: [
          {
            required: true,
            message: "類別不能為空",
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

    /* 獲取年度學分表資料 */
    getList() {
      const vm = this;
      singleFiles.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          if (this.list.length > 0) {
            this.$notify({
              title: "錯誤",
              message: "最多僅能新增一筆！",
              type: "error",
              duration: 2000,
            });
          } else {
            this.temp = {};
            this.temp.typeId = "SYS_SINGLEFILE_MAP";
            this.temp.typeName = "學制地圖";
            this.fileInfo = {};
            this.modalTitle = "新增";
            this.openModal = true;
          }
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
      singleFiles.getSingleFiles({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.fileInfo = {};
      this.openModal = true;
    },
    handleSelectionChange(data) {
      this.selectListId = data.map((res) => res.id);
      this.selectLIstCount = data.length;
    },
    handleCurrentChange() {},
    customUpload(file) {
      const vm = this;
      let formData = new FormData();
      formData.append("files", file.file, file.file.name);
      axios
        .post(`${process.env.VUE_APP_BASE_API}Files/Upload`, formData)
        .then((response) => {
          vm.fileInfo = response.data.result[0];
          vm.temp.fileLink = "http://140.131.21.65/" + vm.fileInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },
    addEduMap() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          singleFiles.addSingleFiles(vm.temp).then((res) => {
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
    editEduMap() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          singleFiles.updateSingleFiles(vm.temp).then((res) => {
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
    delEduMap() {
      const vm = this;
      singleFiles.delSingleFiles(vm.selectListId).then((res) => {
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