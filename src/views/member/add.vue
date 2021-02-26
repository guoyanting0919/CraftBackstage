<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="featuresBox">
        <div class="mx-16 featuresBox__goPrev">
          <i class="el-icon-back" @click="goPrev"></i>
        </div>
        <div class="filter-container">
          <el-select v-model="getMemberType" class="mr-20" placeholder="請選擇類別" no-match-text="暫無數據" @change="filterType">
            <el-option value="all" label="全部類別"></el-option>
            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.dtValue">
            </el-option>
          </el-select>
          <el-button type="primary" size="mini" plain @click="handleAdd">
            <i class="iconfont icon-xinzeng"></i>
            新增
          </el-button>
          <el-button type="danger" size="mini" plain @click="handleDel">
            <i class="iconfont icon-garbage"></i>
            刪除
          </el-button>
        </div>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title :title="'新增『' + memberName + '』相關資料'"></Title>
      <div class="bg-white" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)" @row-click="rowClick" @selection-change="handleSelectionChange">
          <el-table-column align="center" type="selection" width="55"></el-table-column>
          <el-table-column min-width="180px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'年度'">
            <template slot-scope="scope">
              <span>{{ scope.row.year }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column min-width="80px" :label="'參與人'">
            <template slot-scope="scope">
              <span>{{ scope.row.joinMember }}</span>
            </template>
          </el-table-column> -->
          <el-table-column min-width="250px" :label="'擔任之職務'">
            <template slot-scope="scope">
              <span>{{ scope.row.jobTitle }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column min-width="150px" :label="'連結'">
            <template slot-scope="scope">
              <span>{{ scope.row.links }}</span>
            </template>
          </el-table-column> -->
          <el-table-column min-width="100px" :label="'開始日期'">
            <template slot-scope="scope">
              <span>{{ scope.row.startDate | moment("YYYY-MM-DD") }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="80px" :label="'類別'">
            <template slot-scope="scope">
              <span>{{ scope.row.dataTypeName }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column min-width="50px" :label="'排序'">
            <template slot-scope="scope">
              <span>{{ scope.row.sort }}</span>
            </template>
          </el-table-column> -->
          <el-table-column property="setting" label="操作" width="220">
            <template slot-scope="scope">
              <el-button size="mini" type="warning" @click="handleEdit(scope.row)">
                編輯
              </el-button>
              <el-button size="mini" type="info" @click="addImage(scope.row.id)">
                新增相片
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- modal -->
    <!-- add -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="50%">
      <el-tabs v-model="temp.dataTypeId" @tab-click="handleClick">
        <el-tab-pane :label="item.name" :name="item.dtValue" v-for="item in typeList" :key="item.id">
          <el-form v-if="temp.dataTypeId" :rules="rules" :ref="`dataForm${item.dtValue}`" :model="temp" label-position="right" label-width="100px">
            <!-- title -->
            <el-form-item size="small" :label="'標題'" prop="title">
              <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
            </el-form-item>
            <!-- contents -->
            <el-form-item size="small" :label="'內容'" prop="contents" v-if="check('內容')">
              <vue-editor v-model="temp.contents" v-if="temp.dataTypeId == 'SYS_MEMBERDATA_RESEARCHPUBLIC'" />
              <!-- <el-input type="textarea" v-model="temp.contents" :autosize="{ minRows: 2 }" placeholder="請輸入內容" v-else></el-input> -->
            </el-form-item>
            <!-- year -->
            <el-form-item size="small" :label="'年度'" v-if="check('年度')">
              <el-date-picker class="fw" v-model="temp.year" type="year" value-format="yyyy" placeholder="請選擇年度">
              </el-date-picker>
            </el-form-item>
            <!-- joinMember -->
            <el-form-item size="small" :label="'參與人'" v-if="check('參與人')">
              <el-input v-model="temp.joinMember" placeholder="請輸入參與人"></el-input>
            </el-form-item>
            <!-- jobTitle -->
            <el-form-item size="small" :label="temp.dataTypeId == 'SYS_MEMBERDATA_EDUCATION'? '系所' : '擔任之職務'" v-if="check('職稱')">
              <el-input v-model="temp.jobTitle" placeholder="請輸入擔任之職務"></el-input>
            </el-form-item>
            <!-- mechanismName -->
            <el-form-item size="small" :label="specialName()" v-if="check('機構')">
              <el-input v-model="temp.mechanismName" :placeholder="'請輸入' + specialName()"></el-input>
            </el-form-item>
            <!-- startDate -->
            <el-form-item size="small" :label="'開始時間'" prop="startDate">
              <el-date-picker class="fw" v-model="temp.startDate" type="date" value-format="yyyy-MM-dd" placeholder="請選擇日期">
              </el-date-picker>
            </el-form-item>
            <!-- endDate -->
            <el-form-item size="small" :label="'結束時間'">
              <el-date-picker class="fw" v-model="temp.endDate" type="date" value-format="yyyy-MM-dd" placeholder="請選擇日期">
              </el-date-picker>
            </el-form-item>
            <!-- 備註 -->
            <el-form-item size="small" :label="'備註'" v-if="check('備註')">
              <el-input v-model="temp.remark" placeholder="請輸入備註"></el-input>
            </el-form-item>
            <!-- sort -->
            <el-form-item size="small" :label="'排序'">
              <el-input v-model="temp.sort" placeholder="請輸入排序（預設：999）"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="addMemberData" v-if="modalTitle == '新增'">
          確認
        </el-button>
        <el-button type="primary" @click="editMemberData" v-else>確認</el-button>
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
        <el-button type="primary" @click="delMemberData">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import Pagination from "@/components/Pagination";

import * as member from "@/api/member";
import * as departmentMemberDatas from "@/api/departmentMemberDatas";
import * as categorys from "@/api/categorys";

export default {
  name: "award",
  components: { Sticky, Title, Pagination },
  data() {
    return {
      list: [], // 菜單列表
      typeList: [],
      memberName: "",
      total: 10,
      getMemberType: "all",
      listLoading: false,
      listQuery: {
        MemberId: this.$route.params.id,
        DataTypeId: "",
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        memberId: "",
        dataTypeId: "",
        dataTypeName: "",
        year: "",
        title: "",
        contents: "",
        joinMember: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        mechanismName: "",
        annexFile: "",
        links: "",
        remark: "",
        sort: "",
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
            message: "標題不能為空",
            trigger: "blur",
          },
        ],
        startDate: [
          {
            required: true,
            message: "開始日期不能為空",
            trigger: "change",
          },
        ],
      },
      mapping: {
        // 內容     年度  參與人     職稱     機構           連結  備註
        // contents year joinMember jobTitle mechanismName links remark
        SYS_MEMBERDATA_RESEARCHPUBLIC: ["內容"],
        // 計畫
        SYS_MEMBERDATA_RESEARCPLAN: ["年度", "參與人", "職稱", "機構", "連結"],
        // 產學
        SYS_MEMBERDATA_INDUSTRYCOOPE: [
          "年度",
          "參與人",
          "職稱",
          "機構",
          "連結",
          "備註",
        ],
        // 校內
        SYS_MEMBERDATA_SCHOOLHONOR: ["年度", "機構"],
        // 校外
        SYS_MEMBERDATA_OFFCAMPUSHONOR: ["年度", "機構"],
        // 學歷
        SYS_MEMBERDATA_EDUCATION: ["機構", "系所", "職稱"],
        // 經歷
        SYS_MEMBERDATA_EXP: ["機構", "職稱"],
      },
    };
  },
  computed: {
    specialName() {
      return () => {
        if (
          this.temp.dataTypeId == "SYS_MEMBERDATA_RESEARCPLAN" ||
          this.temp.dataTypeId == "SYS_MEMBERDATA_INDUSTRYCOOPE"
        ) {
          return "補助機構";
        } else if (
          this.temp.dataTypeId == "SYS_MEMBERDATA_SCHOOLHONOR" ||
          this.temp.dataTypeId == "SYS_MEMBERDATA_OFFCAMPUSHONOR"
        ) {
          return "頒獎中心";
        } else if (this.temp.dataTypeId == "SYS_MEMBERDATA_EDUCATION") {
          return "國別";
        } else if (this.temp.dataTypeId == "SYS_MEMBERDATA_EXP") {
          return "部門/系所";
        }
      };
    },
  },
  methods: {
    //check
    check(str) {
      return this.mapping[this.temp.dataTypeId]?.includes(str);
    },
    /* 獲取資料 */
    getMember() {
      const listQuery = {
        MemberTypeId: "",
        page: 1,
        limit: 20,
        key: undefined,
      }
      member.getList(listQuery).then((res) => {
        this.memberName = res.data[0].name;
      });
    },
    getList() {
      const vm = this;
      departmentMemberDatas.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },
    getType() {
      const vm = this;
      let params = {
        TypeId: "SYS_MEMBERDATA",
        limit: 999,
      };
      categorys.LoadNoProperty(params).then((res) => {
        vm.typeList = res.data;
      });
    },
    handleClick(tab) {
      const vm = this;
      vm.typeList.filter((item) => {
        if (tab.name === item.dtValue) {
          vm.temp.dataTypeName = item.name;
        }
      });
    },
    rowClick() {},
    handleAdd() {
      this.temp = {};
      this.temp.sort = 999;
      this.$set(this.temp, "dataTypeId", "SYS_MEMBERDATA_RESEARCHPUBLIC");
      this.modalTitle = "新增";
      this.openModal = true;
    },
    handleEdit(data) {
      this.temp.dataTypeId = data.dataTypeId;
      departmentMemberDatas
        .getDepartmentMemberDatas({ id: data.id })
        .then((res) => {
          this.temp = Object.assign({}, res.result);
        });
      this.modalTitle = "編輯";
      this.openModal = true;
    },
    handleDel() {
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
    },
    addImage(albumId) {
      this.$router.push("/record/add/" + albumId);
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
    addMemberData() {
      const vm = this;
      vm.temp.memberId = this.$route.params.id;
      vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
      const dom = `dataForm${this.temp.dataTypeId}`;

      vm.$refs[dom][0].validate((valid) => {
        if (valid) {
          departmentMemberDatas
            .addDepartmentMemberDatas(vm.temp)
            .then((res) => {
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
    editMemberData() {
      const vm = this;
      vm.temp.sort = vm.temp.sort ? vm.temp.sort : 999;
      const dom = `dataForm${vm.temp.dataTypeId}`;

      vm.$refs[dom][0].validate((valid) => {
        // vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentMemberDatas
            .updateDepartmentMemberDatas(vm.temp)
            .then((res) => {
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
    delMemberData() {
      const vm = this;
      departmentMemberDatas
        .delDepartmentMemberDatas(vm.selectListId)
        .then((res) => {
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
    filterType(val) {
      if (val !== "all") {
        this.listQuery.DataTypeId = val;
        this.getList();
      } else {
        this.listQuery.DataTypeId = "";
        this.getList();
      }
    },
    goPrev() {
      this.$router.push("/member/index");
    },
  },
  mounted() {
    this.getList();
    this.getType();
    this.getMember();
  },
};
</script>

<style lang="scss">
.featuresBox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    color: #c9b175;
    border-bottom: 1px solid #c9b175;
  }
  &__goPrev {
    cursor: pointer;
  }
  &__del {
    color: #d63737;
    cursor: pointer;
  }
}
</style>