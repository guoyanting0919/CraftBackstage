import request from "@/utils/request";

// 獲取管理員列表
export function getList(params) {
  return request({
    url: "/newss/load",
    method: "get",
    params,
  });
}
