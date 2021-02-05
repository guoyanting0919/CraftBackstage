<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="featuresBox">
        <div class="mx-16 featuresBox__goPrev">
          <i class="el-icon-back" @click="goPrev"></i>
        </div>
        <div class="filter-container">
          <el-select class="mr-20" v-model="getTypeVal" placeholder="請選擇類別" no-match-text="暫無數據" @change="filterType">
            <el-option value="all" label="全部類別"></el-option>
            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.dtValue">
            </el-option>
          </el-select>
          <el-button type="primary" size="mini" plain @click="handleAdd">
            <i class="iconfont icon-xinzeng"></i>
            新增
          </el-button>
        </div>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="工作室成果"></Title>
      <div class="bg-white">
        <el-row class="p-20">
          <el-col class="p-20" :lg="8" :md="12" :sm="24" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }">
              <el-image style="width: 100%; height: 400px" :src="item.pics" fit="cover"></el-image>
              <div class="p-16 d-flex align-items-center justify-content-between">
                <strong>{{ item.title }}</strong>
                <p class="m-0" style="margin-left: auto">
                  公告日期：{{ item.releaseDate | moment("YYYY-MM-DD") }}
                </p>
              </div>
              <div class="featuresBox p-16">
                <el-button size="mini" type="warning" @click="handleEdit(item)" plain>
                  編輯
                </el-button>
                <span class="iconfont icon-garbage featuresBox__del ml-10 font-s-18" @click="handleDel(item)"></span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- modal -->
    <!-- add -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="30%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'公告日期'" prop="releaseDate">
          <el-date-picker class="fw" v-model="temp.releaseDate" type="date" value-format="yyyy-MM-dd" :picker-options="disBeforeTime" placeholder="請選擇公告日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'標題'" prop="title">
          <el-input v-model="temp.title" placeholder="請輸入標題"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'類別'" prop="classTypeId">
          <el-select v-model="temp.classTypeId" class="fw" placeholder="請選擇類別" no-match-text="暫無數據" @change="getTypeName">
            <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.dtValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item size="small" :label="'圖片'" prop="pics">
          <el-upload ref="imageUpload" :show-file-list="false" accept=".png,.jpg,.jpeg,.svg" class="upload-demo" action="" :http-request="customUpload" :limit="999">
            <el-button size="small" type="primary">上傳</el-button>
            <p class="m-0">{{ imgInfo.fileName }}</p>
          </el-upload>
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
import * as departmentTeachs from "@/api/departmentTeachs";
import * as categorys from "@/api/categorys";

export default {
  name: "award",
  components: { Sticky, Title },
  data() {
    return {
      list: [], // 菜單列表
      typeList: [],
      total: 10,
      listLoading: false,
      listQuery: {
        teachTypeId: "SYS_TEACH_WORKSHOP",
        classTypeId: "",
        Years: "",
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        classTypeId: "",
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
        pics: [
          {
            required: true,
            message: "圖片不能為空",
            trigger: "blur",
          },
        ],
      },
      getTypeVal: "all",
      imgInfo: {},
      modalTitle: "",
      openModal: false,
      delModal: false,
      selectListId: "",
      disBeforeTime: {
        disabledDate(date) {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        },
      },
    };
  },
  methods: {
    /* 獲取資料 */
    getList() {
      const vm = this;
      departmentTeachs.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
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
    handleAdd() {
      if (this.$refs.imageUpload) {
        this.$refs.imageUpload.clearFiles();
      }
      this.modalTitle = "新增";
      this.temp = {};
      this.temp.teachTypeId = "SYS_TEACH_WORKSHOP";
      this.temp.teachTypeName = "工作室成果";
      this.imgInfo = {};
      this.openModal = true;
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
          vm.temp.pics =
            `${process.env.VUE_APP_BASE_IMG_URL}` + vm.imgInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },
    getTypeName(typeId) {
      const vm = this;
      vm.typeList.filter((item) => {
        if (typeId === item.dtValue) {
          vm.temp.titleType = item.name;
        }
      });
    },
    addAlbumPic() {
      const vm = this;
      console.log(vm.temp);
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
    editAlbumPic() {
      const vm = this;
      vm.temp.teachTypeId = "SYS_TEACH_WORKSHOP";
      vm.temp.teachTypeName = "工作室成果";
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
    delAlbumPic() {
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
    setCover(data) {
      const vm = this;
      const modifyInfo = {
        id: data.id,
        albumId: data.albumId,
        title: data.title,
        pics: data.pics,
        sort: data.sort,
        isCover: true,
      };
      vm.list.filter((res) => {
        if (res.isCover) {
          const cancelSet = {
            id: res.id,
            albumId: res.albumId,
            title: res.title,
            pics: res.pics,
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
    filterType(val) {
      if (val !== "all") {
        this.listQuery.classTypeId = val;
        this.getList();
      } else {
        this.listQuery.classTypeId = "";
        this.getList();
      }
    },
    goPrev() {
      this.$router.push("/record/index");
    },
  },
  mounted() {
    this.getList();
    this.getType();
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