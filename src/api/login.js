import {request} from '@/utils/request.js'

// 获取验证码   
export const getCaptcha = () => {
	return request({
		url: '/base/captcha',
		method: 'post'
	})
}
// 二合一登录
export const login = (data) => {
	return request({
		url: '/clientUser/login',
		method: 'post',
		data: data
	})
}
// 注册
export const register = (data) => {
	return request({
		url: '/clientUser/register',
		method: 'post',
		data: data
	})
}
