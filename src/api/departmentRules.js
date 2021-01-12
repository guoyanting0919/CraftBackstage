import request from "@/utils/request";

// 獲取列表
export function getList(params) {
  return request({
    url: "/departmentRules/load",
    method: "get",
    params,
  });
}

export function getDepartmentRules(params) {
  return request({
    url: "/departmentRules/get",
    method: "get",
    params
  })
}

export function addDepartmentRules(data) {
  return request({
    url: "/departmentRules/add",
    method: "post",
    data,
  });
}

export function updateDepartmentRules(data) {
  return request({
    url: "/departmentRules/update",
    method: "post",
    data,
  });
}

export function delDepartmentRules(data) {
  return request({
    url: "/departmentRules/delete",
    method: "post",
    data,
  });
}