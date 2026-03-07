<template>
  <view class="page">
    <view class="content">
      <text class="welcome">欢迎回来</text>
      <text class="auth-text">{{ authText }}</text>

      <view v-if="auth === 2" class="bind-panel">
        <text class="bind-title">绑定账号密码</text>
        <view class="form-item">
          <text class="label">账号</text>
          <input class="input" type="text" v-model="bindPasswordForm.username" placeholder="请输入要绑定的账号" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input class="input" :password="!showBindPassword" v-model="bindPasswordForm.password" placeholder="请输入要绑定的密码" />
          <text class="toggle" @click="showBindPassword = !showBindPassword">{{ showBindPassword ? '隐藏' : '显示' }}</text>
        </view>
        <view class="form-item">
          <text class="label">重复密码</text>
          <input class="input" :password="!showBindConfirmPassword" v-model="bindPasswordForm.confirmPassword" placeholder="请再次输入密码" />
          <text class="toggle" @click="showBindConfirmPassword = !showBindConfirmPassword">{{ showBindConfirmPassword ? '隐藏' : '显示' }}</text>
        </view>
        <view class="form-item">
          <text class="label">验证码</text>
          <view class="captcha-content">
            <input class="input captcha-input" type="number" v-model="bindPasswordForm.captcha" placeholder="请输入验证码" maxlength="6" />
            <image class="captcha-img" :src="captchaImageUrl" mode="aspectFit" @click="refreshCaptcha" />
          </view>
        </view>
        <button type="primary" :loading="bindPasswordLoading" :disabled="bindPasswordLoading || bindWechatLoading" @click="handleBindPassword">
          {{ bindPasswordLoading ? '绑定中...' : '绑定账号密码' }}
        </button>
      </view>

      <view v-else-if="auth === 1" class="bind-panel">
        <text class="bind-title">绑定微信</text>
        <view class="form-item">
          <text class="label">偏好账号</text>
          <input class="input" type="text" v-model="bindWechatForm.preferAccount" placeholder="将自动使用微信手机号，可手动修改" />
        </view>
        <view class="form-item">
          <text class="label">表名列表</text>
          <input class="input" type="text" v-model="bindWechatTablesText" placeholder="请输入tables，多个逗号分隔" />
        </view>
        <button
          type="primary"
          open-type="getPhoneNumber"
          :loading="bindWechatLoading"
          :disabled="bindPasswordLoading || bindWechatLoading"
          @getphonenumber="handleBindWechatByPhone"
        >
          {{ bindWechatLoading ? '绑定中...' : '绑定微信' }}
        </button>
      </view>

      <view v-if="passwordMergePopupVisible" class="merge-mask">
        <view class="merge-card">
          <text class="merge-title">账号已注册，验证密码后合并</text>
          <text class="merge-account">目标账号：{{ mergeAccount }}</text>
          <input class="input merge-input" :password="!showMergePassword" v-model="mergePassword" placeholder="请输入该账号密码进行验证" />
          <text class="toggle" @click="showMergePassword = !showMergePassword">{{ showMergePassword ? '隐藏' : '显示' }}</text>
          <view class="merge-actions">
            <button class="merge-btn cancel-btn" :disabled="mergeLoading" @click="closePasswordMergePopup">取消</button>
            <button class="merge-btn confirm-btn" type="primary" :loading="mergeLoading" :disabled="mergeLoading" @click="confirmPasswordMerge">
              {{ mergeLoading ? '验证中...' : '验证并合并' }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { bindPassword, bindWechat, getCaptcha } from '@/api/login.js'

const user = ref(uni.getStorageSync('user') || {})
const auth = computed(() => Number(user.value?.auth || 0))
const authText = computed(() => {
  if (auth.value === 1) return '当前登录方式：账号密码登录'
  if (auth.value === 2) return '当前登录方式：微信登录'
  return '当前登录方式：未知'
})

const bindPasswordForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  captchaId: '',
})

const bindWechatForm = reactive({
  openId: '',
  preferAccount: '',
})

const bindWechatTablesText = ref('')
const captchaImageUrl = ref('')

const getBindCaptcha = async () => {
  const res = await getCaptcha()
  if (res && res.code === 0) {
    captchaImageUrl.value = res.data.picPath
    bindPasswordForm.captchaId = res.data.captchaId
  }
}

getBindCaptcha()

if (user.value?.openId || user.value?.openid) {
  bindWechatForm.openId = user.value.openId || user.value.openid
}
if (user.value?.username) {
  bindWechatForm.preferAccount = user.value.username
}

const refreshCaptcha = () => {
  getBindCaptcha()
}

const bindPasswordLoading = ref(false)
const bindWechatLoading = ref(false)
const mergeLoading = ref(false)
const showBindPassword = ref(false)
const showBindConfirmPassword = ref(false)
const showMergePassword = ref(false)
const passwordMergePopupVisible = ref(false)
const mergeAccount = ref('')
const mergePassword = ref('')

const isBindPasswordConflict = (res) => {
  const msg = String(res?.msg || '')
  if (!msg) return false
  return msg.includes('冲突') || msg.includes('已注册') || msg.includes('已存在')
}

const closePasswordMergePopup = () => {
  passwordMergePopupVisible.value = false
  mergePassword.value = ''
  showMergePassword.value = false
}

const onBindPasswordSuccess = (res) => {
  const nextUser = res.data?.user || { ...user.value, auth: 1 }
  user.value = nextUser
  uni.setStorageSync('user', nextUser)
  bindPasswordForm.username = ''
  bindPasswordForm.password = ''
  bindPasswordForm.confirmPassword = ''
  bindPasswordForm.captcha = ''
  bindPasswordForm.captchaId = ''
  refreshCaptcha()
  closePasswordMergePopup()
  uni.showToast({ title: '绑定成功', icon: 'success' })
}

const handleBindPassword = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!bindPasswordForm.username) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  if (!bindPasswordForm.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (!bindPasswordForm.confirmPassword) {
    uni.showToast({ title: '请再次输入密码', icon: 'none' })
    return
  }
  if (bindPasswordForm.password !== bindPasswordForm.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  if (!bindPasswordForm.captcha) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  bindPasswordLoading.value = true
  try {
    const res = await bindPassword(
      {
        username: bindPasswordForm.username,
        password: bindPasswordForm.password,
        confirmPassword: bindPasswordForm.confirmPassword,
        captcha: bindPasswordForm.captcha,
        captchaId: bindPasswordForm.captchaId,
      },
      token,
    )
    if (res && res.code === 0) {
      onBindPasswordSuccess(res)
    } else if (isBindPasswordConflict(res)) {
      mergeAccount.value = bindPasswordForm.username
      mergePassword.value = ''
      showMergePassword.value = false
      passwordMergePopupVisible.value = true
    }
  } catch (error) {
    uni.showToast({ title: '网络异常，绑定失败', icon: 'none' })
  } finally {
    bindPasswordLoading.value = false
  }
}

const confirmPasswordMerge = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!mergePassword.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (!bindPasswordForm.captcha || !bindPasswordForm.captchaId) {
    uni.showToast({ title: '请先输入验证码', icon: 'none' })
    return
  }
  mergeLoading.value = true
  try {
    const mergeRes = await bindPassword(
      {
        username: mergeAccount.value,
        password: mergePassword.value,
        confirmPassword: mergePassword.value,
        captcha: bindPasswordForm.captcha,
        captchaId: bindPasswordForm.captchaId,
        merge: true,
        forceMerge: true,
      },
      token,
    )
    if (mergeRes && mergeRes.code === 0) {
      onBindPasswordSuccess(mergeRes)
    }
  } catch (error) {
    uni.showToast({ title: '网络异常，合并失败', icon: 'none' })
  } finally {
    mergeLoading.value = false
  }
}

const handleBindWechat = async () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  if (!bindWechatForm.openId) {
    uni.showToast({ title: '请输入OpenID', icon: 'none' })
    return
  }
  if (!bindWechatForm.preferAccount) {
    uni.showToast({ title: '请输入偏好账号', icon: 'none' })
    return
  }
  const tables = bindWechatTablesText.value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  if (!tables.length) {
    uni.showToast({ title: '请至少填写一个表名', icon: 'none' })
    return
  }
  bindWechatLoading.value = true
  try {
    const bindRes = await bindWechat(
      {
        openId: bindWechatForm.openId,
        preferAccount: bindWechatForm.preferAccount,
        tables,
      },
      token,
    )
    if (bindRes && bindRes.code === 0) {
      const nextUser = bindRes.data?.user || { ...user.value, auth: 2 }
      user.value = nextUser
      uni.setStorageSync('user', nextUser)
      uni.showToast({ title: '绑定成功', icon: 'success' })
      return true
    }
    return bindRes
  } catch (error) {
    uni.showToast({ title: '网络异常，绑定失败', icon: 'none' })
    return false
  } finally {
    bindWechatLoading.value = false
  }
}

const parseConflictOptions = (res) => {
  const raw = res?.data?.conflictAccounts
    || res?.data?.accounts
    || res?.data?.list
    || res?.data?.options
    || []
  if (!Array.isArray(raw)) return []
  return raw
    .map(item => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') return item.username || item.account || item.preferAccount || ''
      return ''
    })
    .filter(Boolean)
}

const tryBindWechatWithConflictChoose = async () => {
  const result = await handleBindWechat()
  if (result === true || result === false || !result) return
  const msg = String(result.msg || '')
  const conflictOptions = parseConflictOptions(result)
  if (!msg.includes('冲突') && !conflictOptions.length) return
  if (!conflictOptions.length) {
    uni.showModal({
      title: '绑定冲突',
      content: msg || '账号存在冲突，请联系管理员处理',
      showCancel: false,
    })
    return
  }
  uni.showActionSheet({
    itemList: conflictOptions,
    success: async (selectRes) => {
      const chosenAccount = conflictOptions[selectRes.tapIndex]
      if (!chosenAccount) return
      bindWechatForm.preferAccount = chosenAccount
      await handleBindWechat()
    },
  })
}

const handleBindWechatByPhone = async (e) => {
  const detail = e?.detail || {}
  if (detail.errMsg && detail.errMsg.includes('fail')) {
    uni.showToast({ title: '你已取消手机号授权', icon: 'none' })
    return
  }
  const phone = detail.phoneNumber || detail.purePhoneNumber || ''
  if (phone) {
    bindWechatForm.preferAccount = phone
  }
  const openIdFromDetail = detail.openId || detail.openid || ''
  if (openIdFromDetail) {
    bindWechatForm.openId = openIdFromDetail
  }
  if (!bindWechatForm.preferAccount) {
    uni.showToast({ title: '未获取到手机号，请手动填写偏好账号', icon: 'none' })
    return
  }
  if (!bindWechatForm.openId) {
    uni.showToast({ title: '未获取到openId，请先完成一次微信登录', icon: 'none' })
    return
  }
  await tryBindWechatWithConflictChoose()
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.header {
  font-size: 40rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40rpx;
}

.content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
}

.welcome {
  font-size: 32rpx;
  color: #333333;
}

.auth-text {
  margin-top: 16rpx;
  display: block;
  color: #666;
  font-size: 26rpx;
}

.bind-panel {
  margin-top: 40rpx;
}

.bind-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.input {
  width: 100%;
  height: 76rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  border-radius: 8rpx;
  background-color: #f7f7f7;
  font-size: 28rpx;
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

.toggle {
  margin-top: 10rpx;
  display: inline-block;
  color: #007aff;
  font-size: 24rpx;
}

.merge-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
  z-index: 99;
}

.merge-card {
  width: 100%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.merge-title {
  display: block;
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.merge-account {
  display: block;
  margin-top: 16rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #666;
}

.merge-input {
  margin-bottom: 12rpx;
}

.merge-actions {
  margin-top: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.merge-btn {
  width: 46%;
}

.cancel-btn {
  background-color: #f2f3f5;
  color: #666;
}

.confirm-btn {
  background-color: #007aff;
}
</style>
