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
		url: '/auth/login/password',
		method: 'post',
		data: data
	})
}
// 注册
export const register = (data) => {
	return request({
		url: '/auth/register/password',
		method: 'post',
		data: data
	})
}

export const wxCodeLogin = (data) => {
	return request({
		url: '/auth/login/wechat',
		method: 'post',
		data: data
	})
}

export const wxPhoneRegister = (data) => {
	return request({
		url: '/userInfo/wxPhoneRegister',
		method: 'post',
		data: data
	})
}
