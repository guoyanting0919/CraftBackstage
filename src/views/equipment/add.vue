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
      <Title :title="'新增圖片（' + albumTitle + '）'"></Title>
      <div class="bg-white">
        <el-row class="p-20">
          <el-col class="p-20" :lg="8" :md="12" :sm="24" v-for="item in list" :key="item.id">
            <el-card :body-style="{ padding: '0px' }">
              <el-image style="width: 100%; height: 400px" :src="item.links" fit="cover"></el-image>
              <div class="fw">
                <div class="px-16 pt-16">
                  <strong class="font-s-18">{{ item.description }}</strong>
                </div>
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
    </div>

    <!-- modal -->
    <!-- add -->
    <el-dialog :title="modalTitle" :visible.sync="openModal" width="30%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="right" label-width="100px">
        <el-form-item size="small" :label="'名稱'" prop="description">
          <el-input v-model="temp.description" placeholder="請輸入名稱"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="'圖片'" prop="links">
          <el-upload ref="imageUpload" :show-file-list="false" accept=".png,.jpg,.jpeg,.svg" class="upload-demo" action="" :http-request="customUpload" :limit="999">
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

import * as classRooms from "@/api/classrooms";
import * as classRoomsPic from "@/api/classroomsPic";

export default {
  name: "award",
  components: { Sticky, Title },
  data() {
    return {
      albumTitle: "",
      list: [], // 菜單列表
      total: 10,
      listLoading: false,
      listQuery: {
        RoomId: this.$route.params.id,
        page: 1,
        limit: 20,
        key: undefined,
      },
      temp: {
        id: "",
        roomId: "",
        linkType: 0,
        links: "",
        description: "",
        sort: "",
        isCover: false,
      },
      rules: {
        description: [
          {
            required: true,
            message: "名稱不能為空",
            trigger: "blur",
          },
        ],
        links: [
          {
            required: true,
            message: "圖片不能為空",
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
    getAlbumTitle() {
      classRooms.getClassRooms({ id: this.$route.params.id }).then((res) => {
        this.albumTitle = res.result.title;
      });
    },
    /* 獲取相簿資料 */
    getList() {
      const vm = this;
      classRoomsPic.getList(vm.listQuery).then((res) => {
        vm.list = res.data;
        vm.total = res.count;
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
      classRoomsPic.getClassRoomsPic({ id: data.id }).then((res) => {
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
          vm.temp.links =
            "https://crafts.ntua.edu.tw/api/" + vm.imgInfo.filePath;
        })
        .catch((error) => {
          console.log({ error });
        });
    },
    addAlbumPic() {
      const vm = this;
      const addInfo = {
        id: "",
        roomId: vm.$route.params.id,
        linkType: 0,
        links: vm.temp.links,
        description: vm.temp.description,
        sort: vm.temp.sort,
        isCover: false,
      };
      classRoomsPic.addClassRoomsPic(addInfo).then((res) => {
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
    },
    editAlbumPic() {
      const vm = this;
      classRoomsPic.updateClassRoomsPic(vm.temp).then((res) => {
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
      classRoomsPic.delClassRoomsPic(vm.selectListId).then((res) => {
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
        roomId: data.roomId,
        links: data.links,
        isCover: true,
        sort: data.sort,
      };

      vm.list.filter((res) => {
        if (res.isCover) {
          const cancelSet = {
            id: res.id,
            roomId: res.roomId,
            links: res.links,
            isCover: false,
            sort: data.sort,
          };
          classRoomsPic.updateClassRoomsPic(cancelSet);
          classRoomsPic.updateClassRoomsPic(modifyInfo).then((res) => {
            if (res.code === 200) {
              this.getList();
            }
          });
        } else {
          classRoomsPic.updateClassRoomsPic(modifyInfo).then((res) => {
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
      this.$router.push("/equipment/index");
    },
  },
  mounted() {
    this.getAlbumTitle();
    this.getList();
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