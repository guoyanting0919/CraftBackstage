<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-select class="mr-10" v-model="getBlockVal" placeholder="請選擇區塊" no-match-text="暫無數據" @change="filterBlock">
          <el-option value="all" label="全部區塊"></el-option>
          <el-option v-for="item in blockList" :key="item.id" :label="item.name" :value="item.dtValue">
          </el-option>
        </el-select>
        <el-select v-model="getTypeVal" placeholder="請選擇類別" no-match-text="暫無數據" @change="filterType">
          <el-option value="all" label="全部類別"></el-option>
          <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.dtValue">
          </el-option>
        </el-select>
        <permission-btn size="mini" moduleName="modulemanager" v-on:btn-event="onBtnClicked"></permission-btn>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="四大工坊管理"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column align="center" type="selection" width="55"></el-table-column>
          <el-table-column min-width="100px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="200px" :label="'內容'">
            <template slot-scope="scope">
              <span>{{ scope.row.summary }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'區塊'">
            <template slot-scope="scope">
              <span>{{ scope.row.roomTypeName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.dataTypeName }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="50px" :label="'排序'">
            <template slot-scope="scope">
              <span>{{ scope.row.sort }}</span>
            </template>
          </el-table-column>
          <el-table-column property="setting" label="操作" width="220">
            <template slot-scope="scope">
              <el-button size="mini" type="warning" @click="handleEdit(scope.row)" v-if="hasButton('edit')">
                編輯
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- modal -->
    <!-- add -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="30%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'內容'" prop="summary">
          <el-input type="textarea" v-model="temp.summary" :autosize="{ minRows: 2 }" placeholder="請輸入內容"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'區塊'" prop="roomTypeId">
          <el-select v-model="temp.roomTypeId" class="fw" placeholder="請選擇區塊" no-match-text="暫無數據" @change="getBlockName">
            <el-option v-for="item in blockList" :key="item.id" :label="item.name" :value="item.dtValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item size="small" :label="'類別'" prop="dataTypeId">
          <el-select v-model="temp.dataTypeId" class="fw" placeholder="請選擇類別" no-match-text="暫無數據" @change="getTypeName">
            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.dtValue">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item size="small" :label="'排序'">
          <el-input v-model="temp.sort" placeholder="請輸入排序（預設：999）"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="addClassRooms" v-if="modalTitle == '新增'">
          確認
        </el-button>
        <el-button type="primary" @click="editClassRooms" v-else>確認</el-button>
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
        <el-button type="primary" @click="delClassRooms">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import permissionBtn from "@/components/PermissionBtn";
import Pagination from "@/components/Pagination";

import * as workshopdatas from "@/api/workshopdatas";
import * as categorys from "@/api/categorys";

export default {
  name: "classRooms",
  components: { Sticky, Title, permissionBtn, Pagination },
  data() {
    return {
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      blockList: [],
      typeList: [],
      total: 10,
      listLoading: false,
      listQuery: {
        RoomTypeId: "",
        DataTypeId: "",
        page: 1,
        limit: 999,
        key: undefined,
      },
      temp: {
        id: "",
        roomTypeId: "",
        roomTypeName: "",
        dataTypeId: "",
        dataTypeName: "",
        title: "",
        summary: "",
        sort: "",
      },
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectLIstId: "",
      selectLIstCount: "",
      rules: {
        summary: [
          {
            required: true,
            message: "內容不能為空",
            trigger: "blur",
          },
        ],
      },
      getBlockVal: "all",
      getTypeVal: "all",
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
    getList() {
      const vm = this;
      workshopdatas.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },

    /* 獲取區塊類別 */
    getBlock() {
      const vm = this;
      let params = {
        TypeId: "SYS_CLASSDATA",
        limit: 999,
      };
      categorys.getList(params).then((res) => {
        vm.blockList = res.data;
      });
    },

    /* 獲取四大工坊類別 */
    getType() {
      const vm = this;
      let params = {
        TypeId: "SYS_CLASSTYPE",
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
      workshopdatas.getWorkShopDatas({ id: data.id }).then((res) => {
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
    getBlockName(typeId) {
      const vm = this;
      vm.blockList.filter((item) => {
        if (typeId === item.dtValue) {
          vm.temp.roomTypeName = item.name;
        }
      });
    },
    getTypeName(typeId) {
      const vm = this;
      vm.typeList.filter((item) => {
        if (typeId === item.dtValue) {
          vm.temp.dataTypeName = item.name;
        }
      });
    },
    addClassRooms() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          workshopdatas.addWorkShopDatas(vm.temp).then((res) => {
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
    editClassRooms() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
          workshopdatas.updateWorkShopDatas(vm.temp).then((res) => {
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
    delClassRooms() {
      const vm = this;
      workshopdatas.delWorkShopDatas(vm.selectListId).then((res) => {
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
    filterBlock(val) {
      if (val !== "all") {
        this.listQuery.RoomTypeId = val;
        this.getList();
      } else {
        this.listQuery.RoomTypeId = "";
        this.getList();
      }
    },
    filterType(val) {
      if (val !== "all") {
        this.listQuery.DataTypeId = val;
        this.getList();
      } else {
        this.listQuery.DataTypeId = "";
        this.getList();
      }
    },
  },
  mounted() {
    this.getButtons();
    this.getList();
    this.getBlock();
    this.getType();
  },
};
</script>

<style>
</style>