<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="featuresBox">
        <div class="mx-16 featuresBox__goPrev">
          <i class="el-icon-back" @click="goPrev"></i>
        </div>
        <div class="filter-container">
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
      <Title title="新增相簿圖片"></Title>
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
          <el-table-column min-width="100px" :label="'圖片'">
            <template slot-scope="scope">
              <img :src="scope.row.pic" alt="" width="150px" />
            </template>
          </el-table-column>
          <el-table-column min-width="100px" :label="'標題'">
            <template slot-scope="scope">
              <span>{{ scope.row.title }}</span>
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
              >
                編輯
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
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'圖片'" prop="pic">
          <el-upload
            ref="imageUpload"
            :show-file-list="false"
            accept=".png"
            class="upload-demo"
            action=""
            :http-request="customUpload"
            :limit="999"
          >
            <el-button size="small" type="primary">上傳</el-button>
            <p class="m-0">{{ imgInfo.fileName }}</p>
          </el-upload>
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
        <el-button
          type="primary"
          @click="addAlbumPic"
          v-if="modalTitle == '新增'"
        >
          確認
        </el-button>
        <el-button type="primary" @click="editAlbumPic" v-else>確認</el-button>
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
        <el-button type="primary" @click="delAlbumPic">確認</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Sticky from "@/components/Sticky";
import Title from "@/components/ConsoleTableTitle";
import Pagination from "@/components/Pagination";

import * as departmentAlbemPic from "@/api/departmentAlbemPic";

export default {
  name: "award",
  components: { Sticky, Title, Pagination },
  data() {
    return {
      list: [], // 菜單列表
      total: 10,
      listLoading: false,
      listQuery: {
        AlbumId: this.$route.params.id,
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        albumId: "",
        title: "",
        pic: "",
        sort: "",
        isCover: false,
      },
      rules: {
        title: [
          {
            required: true,
            message: "標題不能為空",
            trigger: "blur",
          },
        ],
      },
      imgInfo: {},
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectListId: "",
      selectLIstCount: "",
    };
  },
  methods: {
    /* 獲取相簿資料 */
    getList() {
      const vm = this;
      departmentAlbemPic.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
      });
    },
    handleCurrentChange() {},
    handleSelectionChange(data) {
      this.selectListId = data.map((res) => res.id);
      this.selectLIstCount = data.length;
    },
    handleAdd() {
      if (this.$refs.imageUpload) {
        this.$refs.imageUpload.clearFiles();
      }
      this.modalTitle = "新增";
      this.temp = {};
      this.imgInfo = {};
      this.temp.sort = 999;
      this.openModal = true;
    },
    rowClick() {},
    handleEdit(data) {
      departmentAlbemPic.getAlbumsPics({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.modalTitle = "編輯";
      this.imgInfo = {};
      this.openModal = true;
    },
    handleDel() {
      this.delModal = true;
    },
    customUpload(file) {
      const vm = this;
      let formData = new FormData();
      formData.append("files", file.file, file.file.name);
      axios
        .post(`${process.env.VUE_APP_BASE_API}Files/Upload`, formData)
        .then((response) => {
          vm.imgInfo = response.data.result[0];
          vm.temp.pic = "http://craft.unitgo.tw/" + vm.imgInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },
    addAlbumPic() {
      const vm = this;
      console.log(vm.temp.pic);
      const addInfo = {
        id: "",
        albumId: vm.$route.params.id,
        title: vm.temp.title,
        pic: vm.temp.pic,
        sort: vm.temp.sort,
        isCover: false,
      };
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          console.log(addInfo);
          departmentAlbemPic.addAlbumsPics(addInfo).then((res) => {
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
    editAlbumPic() {
      const vm = this;
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          departmentAlbemPic.updateAlbumsPics(vm.temp).then((res) => {
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
    delAlbumPic() {
      const vm = this;
      departmentAlbemPic.delAlbumsPics(vm.selectListId).then((res) => {
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
    goPrev() {
      this.$router.push("/record/index");
    },
  },
  mounted() {
    this.getList();
  },
};
</script>

<style lang="scss">
.featuresBox {
  display: flex;
  justify-content: space-between;
  &__goPrev {
    cursor: pointer;
  }
}
// .disUploadSty .el-upload--picture-card {
//   display: none; /* 上传按钮隐藏 */
// }
// .imgPreview {
//   .el-dialog__header {
//     min-height: 40px;
//   }
//   .el-dialog__body {
//     max-height: 100% !important;
//   }
// }
</style>