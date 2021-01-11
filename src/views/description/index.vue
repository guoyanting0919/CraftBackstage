<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-select
          v-model="getSysType"
          class=""
          placeholder="請選擇類別"
          no-match-text="暫無數據"
          @change="filterType"
        >
          <el-option value="all" label="全部類別"></el-option>
          <el-option
            v-for="item in typeList"
            :key="item.id"
            :label="item.name"
            :value="item.dtValue"
          >
          </el-option>
        </el-select>
        <permission-btn
          size="mini"
          moduleName="modulemanager"
          v-on:btn-event="onBtnClicked"
        ></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="年度學分表管理"></Title>
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
          <el-table-column min-width="200" :label="'學年度'">
            <template slot-scope="scope">
              <span>{{ scope.row.fileName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="300" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.typeName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80" :label="'是否有檔案'">
            <template slot-scope="scope">
              <span>{{ !!scope.row.fileLink ? "是" : "否" }}</span>
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
        <el-form-item size="small" :label="'學年度'" prop="fileName">
          <el-input
            v-model="temp.fileName"
            placeholder="請輸入學年度"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'類別'" prop="typeId">
          <el-select
            v-model="temp.typeId"
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
        <el-form-item size="small" :label="'檔案類型'">
          <el-select
            v-model="temp.linkType"
            class="fw"
            placeholder="請選擇類型"
            no-match-text="暫無數據"
          >
            <el-option
              v-for="item in fileTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          size="small"
          :label="'檔案連結'"
          prop="fileLink"
          v-if="temp.linkType == 'link'"
        >
          <el-input
            v-model="temp.fileLink"
            placeholder="請輸入檔案連結"
          ></el-input>
        </el-form-item>
        <el-form-item
          size="small"
          :label="'檔案上傳'"
          v-if="temp.linkType == 'upload'"
        >
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
          @click="addDescription"
          v-if="modalTitle == '新增'"
        >
          確認
        </el-button>
        <el-button type="primary" @click="editDescription" v-else
          >確認</el-button
        >
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
        <el-button type="primary" @click="delDescription">確認</el-button>
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
import * as categorys from "@/api/categorys";

export default {
  name: "singleFiles",
  components: { Sticky, Title, permissionBtn, Pagination },
  data() {
    return {
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      typeList: [],
      fileTypeList: [
        {
          id: 1,
          name: "網址連結",
          value: "link",
        },
        {
          id: 2,
          name: "檔案上傳",
          value: "upload",
        },
      ],
      total: 10,
      listLoading: false,
      listQuery: {
        TypeId: "",
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
        linkType: "",
      },
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectLIstId: "",
      selectLIstCount: "",
      fileInfo: {},
      getSysType: "all",
      fileType: "",
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
        fileLink: [
          {
            required: true,
            message: "檔案不能為空",
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
        let newArr = res.data.filter(
          (obj) => obj.typeId !== "SYS_SINGLEFILE_MAP"
        );
        vm.list = newArr;
        let findEduMap = res.data.filter(
          (obj) => obj.typeId == "SYS_SINGLEFILE_MAP"
        );
        if (findEduMap.length > 0) {
          vm.total = res.count - 1;
        } else {
          vm.total = res.count;
        }
      });
    },

    /* 獲取類別 */
    getType() {
      const vm = this;
      let params = {
        TypeId: "SYS_YEARCLASS",
        limit: 999,
      };
      categorys.getList(params).then((res) => {
        vm.typeList = res.data;
      });
    },

    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          this.temp = {};
          this.fileInfo = {};
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
    getTypeName(typeId) {
      const vm = this;
      vm.typeList.filter((item) => {
        if (typeId === item.dtValue) {
          vm.temp.typeName = item.name;
        }
      });
    },
    filterType(val) {
      if (val !== "all") {
        this.listQuery.TypeId = val;
        this.getList();
      } else {
        this.listQuery.TypeId = "";
        this.getList();
      }
    },
    addDescription() {
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
    editDescription() {
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
    delDescription() {
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
    this.getType();
  },
};
</script>

<style>
</style>