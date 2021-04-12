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
        </div>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="新增相簿圖片"></Title>
      <div class="bg-white">
        <el-row class="p-20">
          <el-col class="p-20" :lg="8" :md="12" :sm="24" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }">
              <el-image style="width: 100%; height: 400px" :src="item.pic" fit="cover"></el-image>
              <div class="p-16 featuresBox__title">
                <strong>{{ item.title }}</strong>
              </div>
              <div class="featuresBox p-16">
                <a class="pb-3" v-if="!item.isCover" @click="setCover(item)">
                  <i class="el-icon-wind-power">設為封面</i>
                </a>
                <p class="m-0" v-else>目前封面</p>
                <div>
                  <el-button size="mini" type="warning" @click="handleEdit(item)" plain>
                    編輯
                  </el-button>
                  <span class="iconfont icon-garbage featuresBox__del ml-10 font-s-18" @click="handleDel(item)"></span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- <div class="bg-white" style="height: calc(100% - 50px)">
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
          <el-table-column min-width="150px" :label="'圖片'">
            <template slot-scope="scope">
              <img :src="scope.row.pic" alt="" width="150px" />
            </template>
          </el-table-column>
          <el-table-column min-width="200px" :label="'標題'">
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
      </div> -->
    </div>

    <!-- modal -->
    <!-- add -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="30%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'圖片'" prop="pic">
          <el-upload ref="imageUpload" :show-file-list="false" accept=".png" class="upload-demo" action="" :http-request="customUpload" :limit="999">
            <el-button size="small" type="primary">上傳</el-button>
            <p class="m-0">{{ imgInfo.fileName }}</p>
          </el-upload>
        </el-form-item>
        <el-form-item size="small" :label="'排序'" prop="sort">
          <el-input v-model="temp.sort" placeholder="請輸入排序（預設：999）"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="openModal = false">取消</el-button>
        <el-button type="primary" @click="addAlbumPic" v-if="modalTitle == '新增'">
          確認
        </el-button>
        <el-button type="primary" @click="editAlbumPic" v-else>確認</el-button>
      </span>
    </el-dialog>

    <!-- delete -->
    <el-dialog title="刪除" :visible.sync="delModal" width="20%">
      <div class="fw">
        <strong class="font-s-18">確定要刪除嗎？ </strong>
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

import * as departmentAlbemPic from "@/api/departmentAlbemPic";

export default {
  name: "award",
  components: { Sticky, Title },
  data() {
    return {
      list: [], // 菜單列表
      listLoading: false,
      listQuery: {
        AlbumId: this.$route.params.id,
        page: 1,
        limit: 999,
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
    };
  },
  methods: {
    /* 獲取相簿資料 */
    getList() {
      const vm = this;
      departmentAlbemPic.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
      });
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
    handleDel(data) {
      this.delModal = true;
      this.selectListId = [data.id];
    },
    customUpload(file) {
      const vm = this;
      let formData = new FormData();
      formData.append("files", file.file, file.file.name);
      axios
        .post(`${process.env.VUE_APP_BASE_API}Files/Upload`, formData)
        .then((response) => {
          vm.imgInfo = response.data.result[0];
          vm.temp.pic = "https://crafts.ntua.edu.tw/api/" + vm.imgInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },
    addAlbumPic() {
      const vm = this;
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
    setCover(data) {
      const vm = this;
      const modifyInfo = {
        id: data.id,
        albumId: data.albumId,
        title: data.title,
        pic: data.pic,
        sort: data.sort,
        isCover: true,
      };
      vm.list.filter((res) => {
        if (res.isCover) {
          const cancelSet = {
            id: res.id,
            albumId: res.albumId,
            title: res.title,
            pic: res.pic,
            sort: data.sort,
            isCover: false,
          };
          departmentAlbemPic.updateAlbumsPics(cancelSet);
          departmentAlbemPic.updateAlbumsPics(modifyInfo).then((res) => {
            if (res.code === 200) {
              this.getList();
            }
          });
        } else {
          departmentAlbemPic.updateAlbumsPics(modifyInfo).then((res) => {
            if (res.code === 200) {
              this.getList();
            }
          });
        }
      });
      vm.$notify({
        title: "成功",
        message: "設置成功",
        type: "success",
        duration: 2000,
      });
    },
    goPrev() {
      this.$router.push("/highlight/index");
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
  align-items: center;

  &__title {
    strong {
      min-height: 45px;
      overflow: hidden;
      -webkit-line-clamp: 2;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
    }
  }
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