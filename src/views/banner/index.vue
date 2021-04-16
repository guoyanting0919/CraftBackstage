<template>
  <div class="flex-column">
    <sticky :className="'sub-navbar'">
      <div class="filter-container">
        <el-button type="primary" size="mini" plain @click="handleAdd">
          <i class="iconfont icon-xinzeng"></i>
          新增
        </el-button>
      </div>
    </sticky>
    <div class="app-container flex-item">
      <Title title="Banner"></Title>
      <div class="bg-white">
        <el-row class="p-20">
          <el-col class="p-20" :lg="12" :sm="24" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }">
              <el-image style="width: 100%; height: 450px" :src="item.pic" fit="cover"></el-image>
              <div class="p-16">
                <div class="pb-8 workInfo">
                  <strong>作品資訊：</strong>
                  <p class="m-0">{{item.workInfo}}</p>
                </div>
                <div class="pb-8 urlLink">
                  <strong>超連結：</strong>
                  <a :href="item.links" target="_blank">
                    {{ item.links }}
                  </a>
                </div>
              </div>
              <div class="featuresBox px-16 pb-16">
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
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="40%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'上架日期'" prop="startDate">
          <el-date-picker class="fw" v-model="temp.startDate" type="date" value-format="yyyy-MM-dd" :picker-options="disBeforeTime" placeholder="請選擇上架日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'下架日期'">
          <el-date-picker class="fw" v-model="temp.endDate" type="date" value-format="yyyy-MM-dd" :picker-options="disBeforeTime" placeholder="請選擇下架日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item size="small" :label="'圖片'">
          <el-upload ref="imageUpload" :show-file-list="false" accept=".png,.jpg,.jpeg,.svg" class="upload-demo" action="" :http-request="customUpload" :limit="999">
            <el-button size="small" type="primary">上傳</el-button>
            <p class="m-0">{{ imgInfo.fileName }}</p>
          </el-upload>
        </el-form-item>
        <el-form-item size="small" :label="'作品資訊'">
          <el-input v-model="temp.workInfo" placeholder="請輸入作品資訊"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'超連結'">
          <el-input v-model="temp.links" placeholder="請輸入網址"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'排序'">
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

import * as banner from "@/api/banner";

export default {
  name: "award",
  components: { Sticky, Title },
  data() {
    return {
      list: [], // 菜單列表
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        pic: "",
        workInfo: "",
        links: "",
        startDate: "",
        endDate: "",
        sort: "",
      },
      rules: {
        startDate: [
          {
            required: true,
            message: "上架日期不能為空",
            trigger: "blur",
          },
        ],
      },
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
    /* 獲取相簿資料 */
    getList() {
      const vm = this;
      banner.getList(vm.listQuery).then((res) => {
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
      banner.getBanner({ id: data.id }).then((res) => {
        this.temp = Object.assign({}, res.result);
      });
      this.imgInfo = {};
      this.modalTitle = "編輯";
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
        pic: vm.temp.pic,
        links: vm.temp.links,
        workInfo: vm.temp.workInfo,
        startDate: vm.temp.startDate,
        endDate: vm.temp.endDate,
        sort: vm.temp.sort,
      };
      vm.$refs["dataForm"].validate((valid) => {
        if (valid) {
          banner.addBanner(addInfo).then((res) => {
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
      banner.updateBanner(vm.temp).then((res) => {
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
    },
    delAlbumPic() {
      const vm = this;
      banner.delBanner(vm.selectListId).then((res) => {
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
    this.getList();
  },
};
</script>

<style lang="scss">
.workInfo {
  width: 100%;
  display: flex;
  align-items: center;
  strong {
    min-width: 85px;
    max-width: 85px;
  }
  p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.urlLink {
  width: 100%;
  display: flex;
  align-items: center;
  strong {
    min-width: 70px;
    max-width: 70px;
  }
  a {
    text-decoration: underline;
    color: #d7c69a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      color: #d7c69a;
    }
  }
}
.featuresBox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    color: #c9b175;
    border-bottom: 1px solid #c9b175;
  }
  &__del {
    color: #d63737;
    cursor: pointer;
  }
}
</style>