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
      <Title title="競賽得獎管理"></Title>
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
          <el-table-column min-width="150px" :label="'圖片'">
            <template slot-scope="scope">
              <img :src="scope.row.pics" alt="" width="150px" />
            </template>
          </el-table-column>
          <el-table-column min-width="400px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column min-width="400px" :label="'內容'">
            <template slot-scope="scope">
              <span>{{ scope.row.contents }}</span>
            </template>
          </el-table-column> -->
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
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="50%">
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
        <el-form-item size="small" :label="'內容'" prop="contents">
          <vue-editor v-model="temp.contents" />
          <!-- <el-input
            type="textarea"
            v-model="temp.contents"
            :autosize="{ minRows: 2 }"
            placeholder="請輸入內容"
          ></el-input> -->
        </el-form-item>
        <el-form-item size="small" :label="'圖片'" prop="pic">
          <el-upload
            ref="imageUpload"
            :show-file-list="false"
            accept=".png,.jpg,.jpeg,.svg"
            class="upload-demo"
            action=""
            :http-request="customUpload"
            :limit="999"
          >
            <el-button size="small" type="primary">上傳</el-button>
            <p class="m-0">{{ imgInfo.fileName }}</p>
          </el-upload>
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
import axios from "axios";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as departmentTeachs from "@/api/departmentTeachs";

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
        teachTypeId: "SYS_TEACH_COMPETITION",
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        teachTypeId: "",
        teachTypeName: "",
        releaseDate: "",
        title: "",
        titleType: "",
        author: "",
        contents: "",
        pics: "",
        annexFile: "",
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
        contents: [
          {
            required: true,
            message: "內容不能為空",
            trigger: "blur",
          },
        ],
      },
      imgInfo: {},
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
      departmentTeachs.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          this.temp = {
            teachTypeId: "SYS_TEACH_COMPETITION",
            teachTypeName: "競賽得獎",
          };
          this.imgInfo = {};
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
      departmentTeachs.getDepartmentTeachs({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.imgInfo = {};
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
          console.log(response.data.result[0]);
          vm.imgInfo = response.data.result[0];
          vm.temp.pics = "http://140.131.21.65/" + vm.imgInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },

    addAward() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentTeachs.addDepartmentTeachs(vm.temp).then((res) => {
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
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentTeachs.updateDepartmentTeachs(vm.temp).then((res) => {
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
      departmentTeachs.delDepartmentTeachs(vm.selectListId).then((res) => {
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