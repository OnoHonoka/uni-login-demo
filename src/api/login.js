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
		url: '/auth/register/wechat',
		method: 'post',
		data: data
	})
}

export const bindPassword = (data, token) => {
	return request({
		url: '/auth/bind/password',
		method: 'post',
		data: data,
		header: {
			'x-token': token
		}
	})
}

export const bindWechat = (data, token) => {
	return request({
		url: '/auth/bind/wechat',
		method: 'post',
		data: data,
		header: {
			'x-token': token
		}
	})
}
