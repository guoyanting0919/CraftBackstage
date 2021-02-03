<template>
  <div class="flex-column" id="workCamp">
    <div class="app-container flex-item">
      <Title title="工作營管理"></Title>
      <div class="bg-white workCampBG" style="height: calc(100% - 50px)">
        <el-table ref="mainTable" :data="list" v-loading="listLoading" border fit highlight-current-row style="width: 100%" height="calc(100% - 52px)">
          <el-table-column :label="'內容'">
            <template slot-scope="scope">
              <!-- <vue-editor class="disEditor" v-model="scope.row.contents" :disabled="true" /> -->
              <ckeditor class="disEditor" :value="scope.row.contents" :config="setConfig" />
            </template>
          </el-table-column>
          <el-table-column property="setting" label="操作" width="220">
            <template slot-scope="scope">
              <el-button size="mini" type="warning" @click="handleEdit(scope.row)" v-if="hasButton('edit')">編輯</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="handleCurrentChange" />
      </div>
    </div>

    <!-- modal -->
    <!-- edit -->
    <el-dialog title="編輯" :visible.sync="openModal" width="60%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'內容'" prop="contents">
          <!-- <vue-editor v-model="temp.contents" /> -->
          <ckeditor :value="temp.contents" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="editNews">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Title from "@/components/ConsoleTableTitle";
import Pagination from "@/components/Pagination";

import * as seminarWorks from "@/api/seminarWork";

export default {
  name: "seminarWorks",
  components: { Title, Pagination },
  data() {
    return {
      setConfig: {
        readOnly: true,
        extraPlugins: "button,panelbutton,colorbutton",
      },
      /* 權限按鈕 */
      buttons: [],
      list: [], // 菜單列表
      total: 10,
      getNewsType: "all",
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        contents: "",
      },
      openModal: false,
      rules: {
        contents: [
          {
            required: true,
            message: "內容不能為空",
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
    /* 獲取最新消資料 */
    getList() {
      const vm = this;
      seminarWorks.getList(vm.listQuery).then((res) => {
        vm.list = res.data.filter((data) => data.typeName == "工作營");
        vm.total = vm.list.length;
      });
    },
    handleEdit(data) {
      seminarWorks.getSeminarWorks({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.openModal = true;
    },
    handleCurrentChange(val) {
      this.listQuery.page = val.page;
      this.listQuery.limit = val.limit;
      this.getList();
    },
    editNews() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          seminarWorks.updateSeminarWorks(vm.temp).then((res) => {
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
  },
  mounted() {
    this.getButtons();
    this.getList();
  },
};
</script>

<style lang="scss" scoped>
#workCamp {
  .disEditor {
    .cke {
      &_contents {
        min-height: calc(100vh - 245px);
      }

      &_top,
      &_bottom {
        display: none !important;
      }
    }
  }
}
</style>