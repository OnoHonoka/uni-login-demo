<template>
  <view class="page">
    <view class="title">Demo</view>

    <view class="form">
      <view class="switch-row">
        <text :class="['switch-item', activeTab === 'login' ? 'switch-item-active' : '']" @click="activeTab = 'login'">
          登录
        </text>
        <text :class="['switch-item', activeTab === 'register' ? 'switch-item-active' : '']"
          @click="activeTab = 'register'">
          注册
        </text>
      </view>

      <!-- 登录表单 -->
      <view v-if="activeTab === 'login'" class="login-section">
        <view class="form-item">
          <text class="label">账号</text>
          <input class="input" type="text" v-model="form.username" placeholder="请输入账号（admin）" />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <view class="input-with-icon">
            <input class="input" :password="!showLoginPassword" v-model="form.password" placeholder="请输入密码（123456）" />
            <uni-icons :type="showLoginPassword ? 'eye-filled' : 'eye'" size="26" color="#999" class="password-icon"
              @click="showLoginPassword = !showLoginPassword" />
          </view>
        </view>

        <view class="form-item captcha-row">
          <text class="label">验证码</text>
          <view class="captcha-content">
            <input class="input captcha-input" type="number" v-model="form.captcha" placeholder="请输入验证码（1234）"
              maxlength="6" />
            <image class="captcha-img" :src="captchaImageUrl" mode="aspectFit" @click="refreshCaptcha" />
          </view>
        </view>

        <view class="tips">H5 端自适应布局，建议手机宽度 375~414 预览。</view>

        <button class="login-btn" type="primary" :loading="loading" :disabled="loading || registerLoading"
          @click="handleLogin">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>

      <!-- 注册表单 -->
      <view v-else class="register-section">
        <view class="form-item">
          <text class="label">账号</text>
          <input class="input" type="text" v-model="registerForm.username" placeholder="请输入注册账号" />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <view class="input-with-icon">
            <input class="input" :password="!showRegisterPassword" v-model="registerForm.password"
              placeholder="请输入密码" />
            <uni-icons :type="showRegisterPassword ? 'eye-filled' : 'eye'" size="26" color="#999" class="password-icon"
              @click="showRegisterPassword = !showRegisterPassword" />
          </view>
        </view>

        <view class="form-item">
          <text class="label">重复密码</text>
          <view class="input-with-icon">
            <input class="input" :password="!showRegisterConfirm" v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码" />
            <uni-icons :type="showRegisterConfirm ? 'eye-filled' : 'eye'" size="26" color="#999" class="password-icon"
              @click="showRegisterConfirm = !showRegisterConfirm" />
          </view>
        </view>

        <button type="primary" class="register-btn" :loading="registerLoading" :disabled="loading || registerLoading"
          @click="handleRegister">
          {{ registerLoading ? '注册中...' : '注册' }}
        </button>
      </view>

      <!-- 其他登录方式：登录/注册都展示 -->
      <view class="divider">
        <view class="line" />
        <text class="divider-text">其他登录方式</text>
        <view class="line" />
      </view>

      <view class="other-login-wrapper">
        <button class="wechat-btn" @click="handleWechatCodeLogin" v-if="!showWxPhoneRegister">
          <view class="wechat-icon">
            <uni-icons type="weixin" color="#1aad19" size="50" />
          </view>
        </button>
        <button
          v-else
          class="wechat-btn"
          open-type="getPhoneNumber"
          @getphonenumber="handleGetPhoneNumber"
        >
          <view class="wechat-icon">
            <uni-icons type="weixin" color="#1aad19" size="50" />
          </view>
          <text class="wechat-text">手机号注册</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { getCaptcha, login, register, wxCodeLogin, wxPhoneRegister } from '@/api/login.js'

// 当前激活 tab：login / register
const activeTab = ref('login')

// 登录表单
const form = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaId: '',
})

// 注册表单
const registerForm = reactive({
  username: "",
  password: "",
  confirmPassword: ""
})

const loading = ref(false)
const registerLoading = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterConfirm = ref(false)
const showWxPhoneRegister = ref(false)

// 示例验证码图片地址，实际项目中换成自己后端的验证码接口
const captchaImageUrl = ref("")

const getCaptchaFunc = async () => {
  const res = await getCaptcha()
  if (res.code === 0) {
    captchaImageUrl.value = res.data.picPath
    form.captchaId = res.data.captchaId
  }
}

getCaptchaFunc()

const handleLogin = async () => {
  if (!form.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }

  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  if (!form.captcha) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const payload = {
      username: form.username,
      password: form.password,
      captcha: form.captcha,
      captchaId: form.captchaId,
    }
    const res = await login(payload)
    if (res && res.code === 0) {
      let token = ''
      if (res.data) {
        if (typeof res.data === 'string') token = res.data
        else token = res.data.token || res.data.accessToken || res.data.tokenKey || ''
      }
      if (token) uni.setStorageSync('token', token)
      uni.showToast({ title: '登录成功', icon: 'success' })
      // 登录成功后清空表单
      form.username = ''
      form.password = ''
      form.captcha = ''
      form.captchaId = ''
    } else {
      uni.showToast({ title: (res && res.msg) || '账号、密码或验证码错误', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络异常，登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }

  if (!registerForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  if (!registerForm.confirmPassword) {
    uni.showToast({ title: '请再次输入密码', icon: 'none' })
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }

  registerLoading.value = true
  try {
    const res = await register(registerForm)

    if (res.code === 0) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
    } else {
      uni.showToast({ title: res.msg || '注册失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络异常，注册失败', icon: 'none' })
  } finally {
    registerLoading.value = false
  }
}


const handleWechatCodeLogin = () => {
  uni.login({
    provider: 'weixin',
    success: async (res) => {
      const code = res.code
      if (!code) {
        uni.showToast({ title: '获取登录凭证失败', icon: 'none' })
        return
      }
      try {
        const loginRes = await wxCodeLogin({ code })
        if (loginRes && loginRes.code === 0) {
          let token = ''
          if (loginRes.data) {
            if (typeof loginRes.data === 'string') {
              token = loginRes.data
            } else {
              token = loginRes.data.token || loginRes.data.accessToken || loginRes.data.tokenKey || ''
            }
          }
          if (token) {
            uni.setStorageSync('token', token)
            uni.showToast({ title: '登录成功', icon: 'success' })
            showWxPhoneRegister.value = false
          } else {
            showWxPhoneRegister.value = true
            uni.showToast({ title: '未找到账号，请授权手机号注册', icon: 'none' })
          }
        } else {
          showWxPhoneRegister.value = true
          uni.showToast({ title: (loginRes && loginRes.msg) || '未找到账号，请授权手机号注册', icon: 'none' })
        }
      } catch (error) {
        uni.showToast({ title: '网络异常，登录失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '微信登录失败', icon: 'none' })
    },
  })
}

const handleGetPhoneNumber = (e) => {
  const detail = e.detail || {}
  const { encryptedData, iv } = detail
  if (!encryptedData || !iv) {
    uni.showToast({ title: '获取手机号失败', icon: 'none' })
    return
  }
  uni.login({
    provider: 'weixin',
    success: async (res) => {
      const code = res.code
      if (!code) {
        uni.showToast({ title: '获取登录凭证失败', icon: 'none' })
        return
      }
      try {
        const registerRes = await wxPhoneRegister({ code, encryptedData, iv })
        if (registerRes && registerRes.code === 0) {
          let registerToken = ''
          if (registerRes.data) {
            if (typeof registerRes.data === 'string') registerToken = registerRes.data
            else registerToken = registerRes.data.token || registerRes.data.accessToken || registerRes.data.tokenKey || ''
          }
          if (registerToken) uni.setStorageSync('token', registerToken)
          uni.showToast({ title: '注册并登录成功', icon: 'success' })
          showWxPhoneRegister.value = false
        } else {
          uni.showToast({ title: (registerRes && registerRes.msg) || '注册失败', icon: 'none' })
        }
      } catch (error) {
        uni.showToast({ title: '网络异常，注册失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.showToast({ title: '获取登录凭证失败', icon: 'none' })
    },
  })
}

const refreshCaptcha = () => {
  // 刷新图形验证码
  getCaptchaFunc()
}
</script>

<style>
/* 整体页面：H5 端友好，居中 + 留白 */
.page {
  min-height: 100vh;
  padding: 50rpx 60rpx 60rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.title {
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 50rpx;
}

.form {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx 60rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.switch-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 32rpx;
}

.switch-item {
  font-size: 30rpx;
  color: #999;
  padding-bottom: 8rpx;
}

.switch-item-active {
  color: #007aff;
  border-bottom: 4rpx solid #007aff;
}

.form-item {
  margin-bottom: 32rpx;
}

.captcha-row {
  margin-bottom: 24rpx;
}

.captcha-content {
  display: flex;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 180rpx;
  height: 70rpx;
  margin-left: 16rpx;
  border-radius: 8rpx;
  background-color: #eee;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  padding: 0 22rpx;
  box-sizing: border-box;
  border-radius: 8rpx;
  background-color: #f7f7f7;
  font-size: 28rpx;
}

.input-with-icon {
  position: relative;
}

.input-with-icon .input {
  padding-right: 80rpx;
}

.password-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.tips {
  font-size: 24rpx;
  color: #999;
  margin: 20rpx 0 40rpx;
}

.login-btn {
  width: 100%;
  border-radius: 999rpx;
}

.login-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #f0f0f0;
}

.register-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #f0f0f0;
}

.register-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.register-btn {
  width: 100%;
  margin-top: 50rpx;
  border-radius: 999rpx;
}

.divider {
  margin: 50rpx 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 24rpx;
}

.line {
  flex: 1;
  height: 1px;
  background-color: #e4e7ed;
}

.divider-text {
  margin: 0 20rpx;
}

.other-login-wrapper {
  margin-top: 10rpx;
  display: flex;
  justify-content: center;
}

.wechat-btn {
  background-color: transparent;
  padding: 0;
}
.wechat-btn::after {
  border: none;
}
.wechat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 32rpx;
  margin: 0 auto 12rpx;
}

.wechat-text {
  text-align: center;
  font-size: 24rpx;
  color: #07c160;
}

/* H5 端可以稍微减少左右留白，保证大屏也居中好看 */
@media screen and (min-width: 768px) {
  .page {
    width: 420px;
    margin: 0 auto;
    padding-top: 120rpx;
  }
}
</style>
