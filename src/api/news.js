import request from "@/utils/request";

// 獲取管理員列表
export function getList(params) {
  return request({
    url: "/newss/load",
    method: "get",
    params,
  });
}

export function getNews(params) {
  return request({
    url: "/newss/get",
    method: "get",
    params
  })
}

export function addNews(data) {
  return request({
    url: "/newss/add",
    method: "post",
    data,
  });
}

export function updateNews(data) {
  return request({
    url: "/newss/update",
    method: "post",
    data,
  });
}

export function delNews(data) {
  return request({
    url: "/newss/delete",
    method: "post",
    data,
  });
}