<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-select
          v-model="getMemberType"
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
      <Title title="系所成員管理"></Title>
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
          <el-table-column min-width="50px" :label="'姓名'">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="100px" :label="'大頭照'">
            <template slot-scope="scope">
              <img :src="scope.row.pic" alt="" width="150px" />
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'聯絡電話'">
            <template slot-scope="scope">
              <span>{{ scope.row.contactTel }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" :label="'Email'">
            <template slot-scope="scope">
              <span>{{ scope.row.email }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.memberTypeName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'職稱'">
            <template slot-scope="scope">
              <span>{{ scope.row.jobTitle }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" :label="'授課領域'">
            <template slot-scope="scope">
              <span>{{ scope.row.teachClass }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="120px" :label="'研究專長'">
            <template slot-scope="scope">
              <span>{{ scope.row.research }}</span>
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
              <el-button
                size="mini"
                type="info"
                @click="addContent(scope.row.id)"
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
        <el-form-item size="small" :label="'姓名'" prop="name">
          <el-input v-model="temp.name" placeholder="請輸入姓名"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'大頭照'" prop="pic">
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
        <el-form-item size="small" :label="'頭銜'">
          <el-input v-model="temp.subName" placeholder="請輸入頭銜"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'聯絡電話'" prop="contactTel">
          <el-input
            v-model="temp.contactTel"
            placeholder="請輸入聯絡電話"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'Email'" prop="email">
          <el-input
            v-model="temp.email"
            placeholder="請輸入聯絡電話"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'類別'" prop="memberTypeId">
          <el-select
            v-model="temp.memberTypeId"
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
        <el-form-item size="small" :label="'職稱'" prop="jobTitle">
          <el-input
            v-model="temp.jobTitle"
            placeholder="請輸入聯絡電話"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'授課領域'" prop="teachClass">
          <el-input
            type="textarea"
            v-model="temp.teachClass"
            :autosize="{ minRows: 2 }"
            placeholder="請輸入授課領域"
          ></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'研究專長'" prop="research">
          <el-input
            type="textarea"
            v-model="temp.research"
            :autosize="{ minRows: 2 }"
            placeholder="請輸入研究專長"
          ></el-input>
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
        <el-button
          type="primary"
          @click="addMember"
          v-if="modalTitle == '新增'"
        >
          確認
        </el-button>
        <el-button type="primary" @click="editMember" v-else>確認</el-button>
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
        <el-button type="primary" @click="delMember">確認</el-button>
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

import * as member from "@/api/member";
import * as categorys from "@/api/categorys";

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
        MemberTypeId: "",
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        subName: "",
        pic: "",
        name: "",
        memberTypeId: "",
        memberTypeName: "",
        officeHour: "",
        jobTitle: "",
        contactTel: "",
        teachClass: "",
        fax: "",
        addr: "",
        research: "",
        department: "",
        email: "",
        webUrl: "",
        bookUrl: "",
        researchUrl: "",
        sort: 999,
      },
      typeList: [],
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectLIstId: "",
      selectLIstCount: "",
      getMemberType: "all",
      rules: {
        name: [
          {
            required: true,
            message: "姓名不能為空",
            trigger: "blur",
          },
        ],
        memberTypeId: [
          {
            required: true,
            message: "類別不能為空",
            trigger: "blur",
          },
        ],
        jobTitle: [
          {
            required: true,
            message: "職稱不能為空",
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
      member.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    /* 獲取最新消息類別 */
    getType() {
      const vm = this;
      let params = {
        TypeId: "SYS_MEMBER",
        limit: 999,
      };
      categorys.getList(params).then((res) => {
        vm.typeList = res.data;
      });
    },
    onBtnClicked(domId) {
      switch (domId) {
        case "add":
          if (this.$refs.imageUpload) {
            this.$refs.imageUpload.clearFiles();
          }
          this.modalTitle = "新增";
          this.temp = {};
          this.temp.sort = 999;
          this.imgInfo = {};
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
      member.getMembers({ id: data.id }).then((res) => {
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
    getTypeName(typeId) {
      const vm = this;
      vm.typeList.filter((item) => {
        if (typeId === item.dtValue) {
          vm.temp.memberTypeName = item.name;
        }
      });
    },
    addMember() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          member.addMembers(vm.temp).then((res) => {
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
    editMember() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          member.updateMembers(vm.temp).then((res) => {
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
    delMember() {
      const vm = this;
      member.delMembers(vm.selectListId).then((res) => {
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
    customUpload(file) {
      const vm = this;
      let formData = new FormData();
      formData.append("files", file.file, file.file.name);
      axios
        .post(`${process.env.VUE_APP_BASE_API}Files/Upload`, formData)
        .then((response) => {
          console.log(response.data.result[0]);
          vm.imgInfo = response.data.result[0];
          vm.temp.pic = "http://craft.unitgo.tw/" + vm.imgInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },
    addContent(id) {
      this.$router.push("/member/add/" + id);
    },
    filterType(val) {
      console.log(val);
      if (val !== "all") {
        this.listQuery.MemberTypeId = val;
        this.getList();
      } else {
        this.listQuery.MemberTypeId = "";
        this.getList();
      }
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